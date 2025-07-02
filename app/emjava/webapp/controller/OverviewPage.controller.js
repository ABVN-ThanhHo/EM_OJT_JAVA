sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "../model/models",
  ],
  (Controller, MessageBox, MessageToast, Fragment, Model) => {
    "use strict";

    return Controller.extend("emjava.controller.OverviewPage", {
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("OverviewPage")
          .attachPatternMatched(this._onRouteMatched, this);

        // Get view
        const oView = this.getView();

        // Get user login model
        const oUserModel = this.getOwnerComponent().getModel("userLoginModel");
        const user = oUserModel.getData();

        if (user.roles !== "Admin") {
          this.byId("actionColumn")?.setVisible(false);
          this.byId("_IDGenHBox2")?.setVisible(false);
          this.byId("_IDGenColumnListItem").setType("Inactive");
        }

        // Get MasterDataModel
        const oMasterDataModel = oView.getModel("MasterDataModel");

        // Retry if not yet available
        if (!oMasterDataModel) {
          setTimeout(() => this.onInit(), 100);
          return;
        }

        // Get data from master model
        const oMasterData = oMasterDataModel.getData();

        // Clone arrays and add "All" at the top
        const aRoles = JSON.parse(JSON.stringify(oMasterData.roles || []));
        const aDepartments = JSON.parse(
          JSON.stringify(oMasterData.departments || [])
        );

        // Add "All" item manually (no i18n)
        aRoles.unshift({ ID: "All", name: "All" });
        aDepartments.unshift({ ID: "All", name: "All" });

        // Create and set new filter model
        const oFilterModel = new sap.ui.model.json.JSONModel({
          roles: aRoles,
          departments: aDepartments,
          selectedRole: "All",
          selectedDepartment: "All",
        });

        oView.setModel(oFilterModel, "FilterModel");
      },

      _onRouteMatched: function () {
        const oView = this.getView();
        const oTable = oView.byId("employeeTable"); // 
      
        if (oTable) {
          const oBinding = oTable.getBinding("items");
          if (oBinding) {
            oBinding.refresh(); // Refreshes the table data
          }
        }
      },

      // On press item in table
      onItemPress: function (oEvent) {
        const oRouter = this.getOwnerComponent().getRouter();

        // Get the selected item
        const oSelectedItem = oEvent.getSource();

        // Get the binding context from EmployeeModel
        const oCtx = oSelectedItem.getBindingContext("EmployeeModel");

        if (!oCtx) {
          console.error("No binding context found for EmployeeModel");
          return;
        }

        // Use getObject() to get the employee data
        const oEmpInfo = oCtx.getObject();

        if (!oEmpInfo || !oEmpInfo.ID) {
          console.error("Employee ID not found");
          return;
        }

        // Navigate using the employee ID
        oRouter.navTo("DetailEmployee", {
          id: oEmpInfo.ID, // Make sure 'ID' is uppercase if that's how it is defined in CDS
        });
      },

      // Press Input Form button
      onInputForm: function (oEvent) {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("CreateEmployee");
      },

      // Press Employee List button
      onEmpList: function (oEvent) {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("OverviewPage");
      },

      // Press Master Data button
      onMasterData: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("MasterDataPage");
      },

      // Handler triggered when delete button is pressed in a table row
      onDeleteEmployeePress: function (oEvent) {
        // Store the binding context (employee) from the clicked button for later deletion
        this._oDeleteContext = oEvent
          .getSource()
          .getParent()
          .getBindingContext("EmployeeModel");

        this._openConfirmDialog({
          title: "Confirm Delete Employee",
          message: "Are you sure you want to delete this employee?",
          state: "Information",
          confirmText: "Delete",
          cancelText: "Cancel",
        });
      },

      // Open or reuse the confirm dialog
      _openConfirmDialog: function (oParams) {
        if (!this._oConfirmDialog) {
          Fragment.load({
            id: this.getView().getId(),
            name: "emjava.view.fragment.ConfirmDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this._oConfirmDialog = oDialog;
              this.getView().addDependent(this._oConfirmDialog);
              this._setDialogProperties(oParams);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this._setDialogProperties(oParams);
          this._oConfirmDialog.open();
        }
      },

      // Helper to set dialog texts and states via a JSONModel
      _setDialogProperties: function (oParams) {
        const oDialogModel = new sap.ui.model.json.JSONModel({
          dialogTitle: oParams.title,
          dialogMessage: oParams.message,
          dialogState: oParams.state,
          confirmText: oParams.confirmText,
          cancelText: oParams.cancelText,
        });
        this._oConfirmDialog.setModel(oDialogModel, "dialog");
      },

      // Press handler for OK button in ConfirmDialog
      onConfirm: async function () {
        if (!this._oDeleteContext) {
          MessageBox.error("No employee selected for deletion.");
          this._oConfirmDialog.close();
          return;
        }

        const oModel = this.getView().getModel("EmployeeModel");
        let sPath = this._oDeleteContext.getPath();
        let groupID = oModel.getGroupId();

        try {
          const deleteResult = await oModel.delete(sPath, groupID, true);
          MessageToast.show("Employee deleted successfully.");
          this._oConfirmDialog.close();
        } catch (err) {
          console.error("Delete failed", err);
          sap.m.MessageBox.error("Failed to delete employee.");
          this._oConfirmDialog.close();
        }
      },

      // Press handler for Cancel button in ConfirmDialog
      onCancel: function () {
        MessageToast.show("Delete canceled");
        this._oConfirmDialog.close();
      },

      // Filter function
      onFilterChange: function () {
        const oView = this.getView();
        const oTable = oView.byId("employeeTable");

        // Get selected key
        const sRoleId = oView.byId("levelFilter").getSelectedKey();
        const sDeptId = oView.byId("levelFilter2").getSelectedKey();

        const aFilters = [];

        if (sRoleId && sRoleId !== "All") {
          aFilters.push(new sap.ui.model.Filter("role_ID", "EQ", sRoleId));
        }
        if (sDeptId && sDeptId !== "All") {
          aFilters.push(
            new sap.ui.model.Filter("department_ID", "EQ", sDeptId)
          );
        }

        const oBinding = oTable.getBinding("items");
        if (oBinding) {
          oBinding.filter(aFilters);
        }
      },
    });
  }
);

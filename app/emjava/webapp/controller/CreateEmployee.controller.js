sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/models",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (Controller, Model, Fragment, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("emjava.controller.CreateEmployee", {
      onInit: function () {
        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            avatarSrc: "",
          }),
          "viewModel"
        );

        // Set validate check
        this._validateDobCheck = true;
        this._validateHireCheck = true;
      },

      // Press Input Form button
      onInputForm: function (oEvent) {
        this.resetForm();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("CreateEmployee");
      },

      // Press Employee List button
      onEmpList: function (oEvent) {
        this.resetForm();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("OverviewPage");
      },

      // Press Master Data button
      onMasterData: function () {
        this.resetForm();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("MasterDataPage");
      },

      // Click Avatar
      onAvatarPress: function () {
        const oUploader = this.byId("fileUploader");
        oUploader.setValue(""); //
        oUploader.getFocusDomRef().click();
      },

      // Handle upload avatar
      onUploadImage: function (oEvent) {
        const oFile = oEvent.getParameter("files")[0];
        const oAvatar = this.byId("avatar");

        if (oFile && FileReader) {
          const reader = new FileReader();
          reader.onload = function (e) {
            oAvatar.setSrc(e.target.result);
          };
          reader.readAsDataURL(oFile);
        }
      },

      // Delete avatar
      onDeleteImage: function () {
        const oAvatar = this.byId("avatar");
        oAvatar.setSrc(""); // Remove image
        // Optionally reset to fallback icon by clearing src
      },

      // On email change
      onEmailChange: function (oEvent) {
        const sEmail = oEvent.getParameter("value").trim();
        const oInput = oEvent.getSource();

        const bValid = this._validateEmail(sEmail);

        if (!bValid) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Please enter a valid email address.");
        } else {
          oInput.setValueState("None"); // Clear error
        }
      },

      // Validate Date of birth
      validateDOB: function (oEvent) {
        const oDatePicker = oEvent.getSource();
        const sDateValue = oEvent.getParameter("value");

        if (!sDateValue) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Date of birth is required.");
          this._validateDobCheck = false;
          return;
        }

        const dob = new Date(sDateValue);
        const today = new Date();

        // Check if input is a valid date
        if (isNaN(dob.getTime())) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText(
            "Invalid date format. Please enter a valid date."
          );
          this._validateDobCheck = false;
          return;
        }

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        const d = today.getDate() - dob.getDate();

        if (m < 0 || (m === 0 && d < 0)) {
          age--;
        }

        if (age < 18) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText(
            "Employee must be at least 18 years old."
          );
          this._validateDobCheck = false;
        } else {
          oDatePicker.setValueState("None");
          oDatePicker.setValueStateText("");
          this._validateDobCheck = true;
        }
      },

      // Validate hireDate
      validateHireDate: function (oEvent) {
        const oDatePicker = oEvent.getSource();
        const sDateValue = oEvent.getParameter("value");

        if (!sDateValue) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Hire Date is required.");
          this._validateHireCheck = false;
          return;
        }

        const hireDate = new Date(sDateValue);

        // Check if the input is a valid date
        if (isNaN(hireDate.getTime())) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Invalid Hire Date format.");
          this._validateHireCheck = false;
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (hireDate > today) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Hire Date cannot be in the future.");
          this._validateHireCheck = false;
        } else {
          oDatePicker.setValueState("None");
          oDatePicker.setValueStateText("");
          this._validateHireCheck = true;
        }
      },

      // Validate email
      _validateEmail: function (email) {
        // Simple email regex
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      },

      // Check email exists
      onValidateEmail: async function () {
        const sEmail = this.byId("emailCreate").getValue().trim();
        const oModel = this.getOwnerComponent().getModel("EmployeeModel");
        let emailExists = false;

        try {
          const aContexts = await oModel
            .bindList("/Employees")
            .requestContexts();
          const bExists = aContexts.some((oContext) => {
            const oEmp = oContext.getObject();
            return oEmp.email?.toLowerCase() === sEmail.toLowerCase();
          });

          if (bExists) {
            this.byId("emailCreate").setValueState("Error");
            this.byId("emailCreate").setValueStateText(
              "This email already exists."
            );
            MessageToast.show("This email already exists.");
            emailExists = false;
            return emailExists;
          } else {
            this.byId("emailCreate").setValueState("None");
            emailExists = true;
            return emailExists;
          }
        } catch (err) {
          console.error("Failed to read employees", err);
          MessageToast.show("Failed to check existing emails.");
          emailExists = false;
          return emailExists;
        }
      },

      // Validate required fields
      _validateRequiredFields: function () {
        const oView = this.getView();
        let bValid = true;
        let value;

        const aFields = [
          oView.byId("firstNameCreate"),
          oView.byId("lastNameCreate"),
          oView.byId("gender1"),
          oView.byId("dobCreate"),
          oView.byId("departmentCreate"),
          oView.byId("hireDateCreate"),
          oView.byId("roleCreate"),
          oView.byId("emailCreate"),
        ];

        aFields.forEach(function (oField) {
          const sValue = oField.getValue?.() || oField.getSelectedKey?.();
          // Trim the value if it’s a string
          if (typeof sValue === "string") {
            value = sValue.trim();
          }

          if (!value) {
            oField.setValueState("Error");
            oField.setValueStateText("This field is required");
            bValid = false;
          } else {
            oField.setValueState("None");
          }
        });

        return bValid;
      },

      // When press Submit button
      onSubmit: async function () {
        // Validate required fields
        if (!this._validateRequiredFields()) {
          MessageToast.show("Please fill all required fields.");
          return;
        }

        // Validate Dob field
        if (!this._validateDobCheck) {
          MessageToast.show("Invalid Date of Birth field.");
          return;
        }

        // Validate HireDate field
        if (!this._validateHireCheck) {
          MessageToast.show("Invalid Hire Date field.");
          return;
        }

        // Check email
        const sEmail = this.byId("emailCreate").getValue().trim();
        const bValidEmail = this._validateEmail(sEmail);

        if (!bValidEmail) {
          this.byId("emailCreate").setValueState("Error");
          this.byId("emailCreate").setValueStateText(
            "Please enter a valid email address."
          );
          MessageToast.show("Please enter a valid email address.");
          return;
        } else {
          this.byId("emailCreate").setValueState("None");
        }

        // Check email exist
        const checkMail = await this.onValidateEmail();
        if (!checkMail) {
          return;
        }

        // Open confirmation dialog
        this._openConfirmDialog({
          title: "Confirm Create",
          message: "Are you sure you want to create this employee?",
          state: "Information",
          confirmText: "Create",
          cancelText: "Cancel",
        });
      },

      // Open Confim fragment
      _openConfirmDialog: function (oParams) {
        if (!this._oConfirmDialog) {
          Fragment.load({
            id: this.getView().getId(),
            name: "emjava.view.fragment.ConfirmDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this._oConfirmDialog = oDialog;
              this.getView().addDependent(oDialog);
              this._setDialogProperties(oParams);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this._setDialogProperties(oParams);
          this._oConfirmDialog.open();
        }
      },

      // Set Dialog Properties
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

      // Set validate check
      _setValidateCheck: function () {
        this._validateDobCheck = true;
        this._validateHireCheck = true;
      },

      // On confirm Update
      onConfirm: function () {
        this.onConfirmSubmit();
        this._setValidateCheck();
      },

      // On confirm close Update
      onCancel: function () {
        this._oConfirmDialog.close();
        this._setValidateCheck();
      },

      // Press OK in Confirm dialog
      onConfirmSubmit: async function () {
        const oView = this.getView();
        const oModel = this.getOwnerComponent().getModel("EmployeeModel");

        // Calculate Salary
        const salary = await this.onCalculateSalary();
        if (!salary) {
          MessageBox.information("Unexpected error during salary calculation. Please try again!");
        } 

        // Set gender
        let genderKey = oView.byId("gender1").getSelectedKey();
        let gender;
        switch (genderKey) {
          case "male":
            gender = "Male";
            break;
          case "female":
            gender = "Female";
            break;
          case "other":
            gender = "Other";
            break;
          default:
            break;
        }

        // Collect form values
        const oNewEmployee = {
          firstName: oView.byId("firstNameCreate").getValue(),
          lastName: oView.byId("lastNameCreate").getValue(),
          gender: gender,
          dateOfBirth: oView
            .byId("dobCreate")
            .getDateValue()
            ?.toISOString()
            .slice(0, 10),
          hireDate: oView
            .byId("hireDateCreate")
            .getDateValue()
            ?.toISOString()
            .slice(0, 10),
          email: oView.byId("emailCreate").getValue(),
          role_ID: oView.byId("roleCreate").getSelectedKey(),
          salary: salary,
          department_ID: oView.byId("departmentCreate").getSelectedKey(),
        };

        try {
          const oBinding = oModel.bindList("/Employees");
          const oContext = await oBinding.create(oNewEmployee).created();

          MessageToast.show("Employee created successfully");

          this.resetForm();
          this._oConfirmDialog.close();
          this.getOwnerComponent().getRouter().navTo("OverviewPage");
        } catch (err) {
          console.error("Error creating employee:", err);

          const aDetails = err.details || err.messages;
          if (aDetails && Array.isArray(aDetails)) {
            aDetails.forEach((d) => {
              console.error(`• ${d.message} (${d.code})`);
            });
          }

          MessageBox.error(
            "Failed to create employee:\n" +
              (aDetails?.map((d) => d.message).join("\n") || err.message)
          );
        }
      },

      // Reset form after submission
      resetForm: function () {
        const oView = this.getView();

        // Clear static inputs
        oView.byId("firstNameCreate").setValue("");
        oView.byId("lastNameCreate").setValue("");
        oView.byId("gender1").setSelectedKey("");
        oView.byId("dobCreate").setValue("");
        oView.byId("departmentCreate").setSelectedKey("");
        oView.byId("hireDateCreate").setValue("");
        oView.byId("roleCreate").setSelectedKey("");
        oView.byId("emailCreate").setValue("");

        // Reset email validation state
        oView.byId("emailCreate").setValueState("None");

        // Reset avatar image (if you're using a viewModel for it)
        this.getView().getModel("viewModel").setProperty("/avatarSrc", "");
      },

      // Validate for comboBox
      onRoleChange: function (oEvent) {
        const oComboBox = oEvent.getSource();
        const sInputValue = oComboBox.getValue().trim();
        const aItems = oComboBox.getItems();

        let bMatchFound = false;
        let sMatchedKey = null;

        for (let i = 0; i < aItems.length; i++) {
          const oItem = aItems[i];
          if (oItem.getText().toLowerCase() === sInputValue.toLowerCase()) {
            bMatchFound = true;
            sMatchedKey = oItem.getKey();
            break;
          }
        }

        if (bMatchFound) {
          oComboBox.setValueState("None");
          oComboBox.setSelectedKey(sMatchedKey); // update the selectedKey if needed
        } else {
          oComboBox.setValueState("Error");
          oComboBox.setValueStateText(
            "Invalid selected. Please choose from the list."
          );
          oComboBox.setSelectedKey(""); // clear invalid key
        }
      },

      // Calculate Salary
      onCalculateSalary: async function () {
        const oView = this.getView();
        const oComboBox = oView.byId("roleCreate");
        const oDatePicker = oView.byId("hireDateCreate");

        const sSelectedRoleId = oComboBox.getSelectedKey();
        const oHireDate = oDatePicker.getDateValue(); // JS Date object

        if (!sSelectedRoleId || !oHireDate) {
          MessageBox.information("Please select a role and hire date.");
          return;
        }

        // Format date to 'YYYY-MM-DD'
        const sFormattedDate = oHireDate.toISOString().split("T")[0];

        // Get OData base service URL
        const oModel = this.getView().getModel("EmployeeModel");
        const sServiceUrl = oModel.sServiceUrl; 

        // Build full request URL
        const sUrl = `${sServiceUrl}calculateSalary?role=${sSelectedRoleId}&hireDate=${sFormattedDate}`;

        try {
          const oResponse = await fetch(sUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include", // include cookies (for session auth)
          });

          if (!oResponse.ok) {
            throw new Error(
              `HTTP ${oResponse.status} - ${oResponse.statusText}`
            );
          }

          const oResult = await oResponse.json();

          if (oResult?.value !== undefined) {
            return parseFloat(oResult.value).toFixed(2)
          } else {
            return false;
          }
        } catch (err) {
          return false;
        }
      },
    });
  }
);

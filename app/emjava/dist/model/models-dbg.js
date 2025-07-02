sap.ui.define(
    [
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/odata/v4/ODataModel",
      "sap/ui/Device",
    ],
    function (JSONModel, ODataModel, Device) {
      "use strict";
  
      return {
        /**
         * Create OData V4 model for Employees (2-way)
         */
        // createEmployeeModel: function () {
        //   return new ODataModel({
        //     serviceUrl: "/odata/v4/",
        //     synchronizationMode: "None", // Required for TwoWay mode
        //     operationMode: "Server",
        //     updateGroupId: "employeeUpdateGroup",
        //     autoExpandSelect: true,
        //   });
        // },
  
        /**
         * Create MasterDataModel by loading departments and roles once
         * and storing in a JSONModel
         */
        createMasterDataModel: async function () {
          const oModel = new JSONModel({ departments: [], roles: [] });
  
          try {
            const [departmentsResponse, rolesResponse] = await Promise.all([
              fetch("/odata/v4/odata/v4/Departments"),
              fetch("/odata/v4/odata/v4/Roles"),
            ]);
  
            if (!departmentsResponse.ok || !rolesResponse.ok) {
              throw new Error("Failed to fetch master data.");
            }
  
            const departmentsData = await departmentsResponse.json();
            const rolesData = await rolesResponse.json();
  
            oModel.setData({
              departments: departmentsData.value,
              roles: rolesData.value,
            });
  
            oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
          } catch (error) {
            console.error("Error loading master data:", error);
          }
  
          return oModel;
        },
  
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        // createDeviceModel: function () {
        //   var oModel = new JSONModel(Device);
        //   oModel.setDefaultBindingMode("OneWay");
        //   return oModel;
        // },
  
        /**
         * set Model to View
         * @param {*} oView : View to be set model
         * @param {*} oData : DataModel
         * @param {*} sModelName : Model Name
         */
        _setModel: function (oView, oModel, sModelName) {
          oView.setModel(new JSONModel(oModel), sModelName);
        },
  
        /**
         * get Model from View
         * @param {*} oView : View to be get model
         * @param {*} sModelName : Model Name
         */
        _getModel: function (oView, sModelName) {
          let oModel = oView.getModel(sModelName);
          return oModel;
        },
  
        // Create Employee
        createEmployee: async function (oEmployeeData) {
          const oModel = sap.ui.getCore().getModel("EmployeeModel");
          await oModel.create("/Employees", oEmployeeData, {
            groupId: "employeeUpdateGroup",
          });
        },
  
        // Get user login
        createUserModel: function () {
          return new Promise(function (resolve, reject) {
            var oModel = new JSONModel();
  
            $.ajax({
              url: "/odata/v4/odata/v4/me()", 
              method: "GET",
              success: function (data) {
                oModel.setData(data);
                resolve(oModel);
              },
              error: function (err) {
                console.error("Failed to load user info", err);
                reject(err);
              },
            });
          });
        },
      };
    }
  );
  
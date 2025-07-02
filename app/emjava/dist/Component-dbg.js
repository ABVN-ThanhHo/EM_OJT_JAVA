sap.ui.define(
    [
      "sap/ui/core/UIComponent",
      "sap/ui/model/json/JSONModel",
      "emjava/model/models",
    ],
    (UIComponent, JSONModel, models) => {
      "use strict";
  
      return UIComponent.extend("emjava.Component", {
        metadata: {
          manifest: "json",
          interfaces: ["sap.ui.core.IAsyncContentCreation"],
        },
  
        async init() {
          // call the base component's init function
          UIComponent.prototype.init.apply(this, arguments);
  
          // Load user login model
          try {
            const userModel = await models.createUserModel();
            this.setModel(userModel, "userLoginModel"); 
          } catch (err) {
            console.error("Failed to load user model:", err);
            this.setModel(new JSONModel({ roles: {} }), "userLoginModel"); 
          }
          
          // Load master data model
          const masterDataModel = await models.createMasterDataModel();
          this.setModel(masterDataModel, "MasterDataModel");
  
          // enable routing
          this.getRouter().initialize();
        },
      });
    }
  );
  
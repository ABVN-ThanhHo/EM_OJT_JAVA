sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("emjava.controller.NotFound", {
      onNavHome: function () {
        this.getOwnerComponent().getRouter().navTo("OverviewPage");
      }
    });
  });
  
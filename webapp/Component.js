sap.ui.define(["sap/ui/core/UIComponent",
 "sap/ui/Device", 
 "arrgestionreclamorasa/arrgestionreclamorasa/model/models"],
  function (e, t, i) {
	"use strict";
	return e.extend("arrgestionreclamorasa.arrgestionreclamorasa.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			e.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			this.setModel(i.createDeviceModel(), "device")
		},
		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact"
				} else {
					this._sContentDensityClass = "sapUiSizeCozy"
				}
			}
			return this._sContentDensityClass
		}
	})
});
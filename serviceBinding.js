function initModel() {
	var sUrl = "/SAP_Gateway/sap/opu/odata/sap/zgw_app_xx_0003_srv/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}
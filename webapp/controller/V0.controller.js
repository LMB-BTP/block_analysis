sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("LMBR_CUSTOMER_APP.block_analysis.controller.V0", {

		onInit: function () {

			/*----------------------------------------------------
			Object: _Settings
			Settings Transaction Processing
			----------------------------------------------------*/
			var _Settings = {

				// Seconds for Auto Refresh
				refreshSeconds: 20,

				// Auto Refresh Switch
				autoRefresh: false,

				// Last Date/Time Data
				lastDateTime: null,

				// Include Empty Systems
				includeEmptySystems: true
			};

			/*----------------------------------------------------
			Object: _BusyControl
			BUsy Control Objects
			----------------------------------------------------*/
			var _BusyControl = {

				Chart01: true,
				Chart02: true,
				Chart03: true
			};

			/*----------------------------------------------------
			Object: _ChartData
			Default Chart Data
			----------------------------------------------------*/
			var _ChartData = {
				BlockUsers: [],
				BlockSystems: []
			};

			/*----------------------------------------------------
			Object: _chartConfig
			Object to agrouped all fields for Chart Control
			----------------------------------------------------*/
			var _chartProperties = {

				//--------------------------
				// Chart 01 Properties
				//--------------------------
				vizPropertiesChart01: {
					title: {
						text: "Blocks By User"
					},

					plotArea: {
						dataLabel: {
							visible: true
						},

						background: {
							color: "transparent"

						}

					},

					legend: {
						title: {
							visible: false
						}

					},
					legendGroup: {
						layout: {
							position: "top"
						}
					},
					categoryAxis: {
						title: {
							visible: false
						}
					},
					valueAxis: {
						title: {
							visible: false
						}
					}
				},

				//--------------------------
				// Chart 02 Properties
				//--------------------------
				vizPropertiesChart02: {
					title: {
						text: "Total x Percent"
					},

					plotArea: {
						dataLabel: {
							visible: true
						},

						background: {
							color: "transparent"
						}

					},

					legend: {
						title: {
							visible: false
						}

					},
					legendGroup: {
						layout: {
							position: "top"
						}
					},
					categoryAxis: {
						title: {
							visible: false
						}
					},
					valueAxis: {
						title: {
							visible: false
						}
					}
				},

				//--------------------------
				// Chart 03 Properties
				//--------------------------
				vizPropertiesChart03: {
					title: {
						text: "Total x Limit"
					},

					plotArea: {
						colorPalette: ["#BB0000", "#E78C07", "#2B7D2B", "#3F5161"],
						dataLabel: {
							hideWhenOverlap: true,
							visible: false
						},

						background: {
							drawingEffect: "glossy",
							gradientDirection: "vertical",
							color: "transparent"
						},

						dataShape: {
							primaryAxis: ["bar", "bar", "bar", "line"]
						}

					},

					legend: {
						title: {
							visible: false
						}

					},
					legendGroup: {
						layout: {
							position: "top"
						}
					},
					categoryAxis: {
						title: {
							visible: false
						}
					},
					valueAxis: {
						title: {
							visible: false
						}
					}
				}
			};

			// Muda Títulos dos gráficos baseado em arquivo i18n
			_chartProperties.vizPropertiesChart01.title.text = this.getView().getModel("i18n").getProperty("BlocksByUser");
			_chartProperties.vizPropertiesChart02.title.text = this.getView().getModel("i18n").getProperty("TotalRecords");
			_chartProperties.vizPropertiesChart03.title.text = this.getView().getModel("i18n").getProperty("TotalLimit");

			// Generate JSONModel for ChartSettings
			var oJsonModelChart = new JSONModel();
			oJsonModelChart.setProperty("/Properties", _chartProperties);
			oJsonModelChart.setProperty("/Settings", _Settings);
			oJsonModelChart.setProperty("/BusyControl", _BusyControl);
			oJsonModelChart.setProperty("/ChartData", _ChartData);

			this.getView().setModel(oJsonModelChart, "Chart");

			// Create Interval Trigger for Auto Refresh, if enabled 
			// Initially without auto refresh
			self = this;
			self.IntervalTrigger = new sap.ui.core.IntervalTrigger(0);
			self.IntervalTrigger.addListener(function () {
				self.autoRefresh();
			});

			// Get Chart Data first time
			self._getChartData();

		},

		/*----------------------------------------------------
		Function: autoRefresh
		Target: Function for Auto Refresh Logic, started after 
				each X seconds
		----------------------------------------------------*/
		autoRefresh: function () {
			MessageToast.show(this.getView().getModel("i18n").getProperty("MessageSelectedData"), {
				duration: 500,
				at: "sap.ui.core.Popup.Dock.CenterCenter"
			});
			this._getChartData();
		},

		/*----------------------------------------------------
		Function: handleAutoRefresh
		Target: Function when "Auto Refresh" switch was changed
		----------------------------------------------------*/
		handleAutoRefresh: function (oControlEvent) {

			// JSon model
			var oJsonModel = this.getView().getModel("Chart");

			// Check if Auto Refresh is Activated
			if (oControlEvent.getParameters().state === true) {

				// Get Seconds Informed and redefine new interval for refresh data
				var sSeconds = oJsonModel.getProperty("/Settings/refreshSeconds");
				sSeconds = sSeconds * 1000;

				// Set Interval Refresh Data
				this.IntervalTrigger.setInterval(sSeconds);

			} else {
				this.IntervalTrigger.setInterval(0);
			}

		},

		/*----------------------------------------------------
		Function: handleSettingsPress
		Target: Function when "Settings" buttons was clicked
		----------------------------------------------------*/
		handleSettingsPress: function (oEvent) {

			if (!this.settingsFragment) {
				this.settingsFragment = sap.ui.xmlfragment(this.getView().getId(), "LMBR_CUSTOMER_APP.block_analysis.view.V0-Settings", this);
				this.getView().addContent(this.settingsFragment);
			}
			this.settingsFragment.open();

		},

		/*----------------------------------------------------
		Function: handleInfoPress
		Target: Function when "Settings" buttons was clicked
		----------------------------------------------------*/
		handleInfoPress: function (oEvent) {

			if (!this.infoFragment) {
				this.infoFragment = sap.ui.xmlfragment(this.getView().getId(), "LMBR_CUSTOMER_APP.block_analysis.view.V0-Info", this);
				this.getView().addContent(this.infoFragment);
			}
			this.infoFragment.open();

		},

		/*----------------------------------------------------
		Function: handleClosePress
		Target: Function when "Settings" or "Info" close buttons was clicked
		----------------------------------------------------*/
		handleClosePress: function (oEvent) {

			// If Settings Fragment is Opened
			if (this.settingsFragment) {
				this.settingsFragment.close();
			}

			// If Info Fragment is Opened
			if (this.infoFragment) {
				this.infoFragment.close();
			}

		},

		/*----------------------------------------------------
		Function: _getDataBlockUsers
		Target: Get Data from BlockUsers EntitySet
		----------------------------------------------------*/
		_getDataBlockUsers: function (oDataModel, oJsonModel) {

			// Callback para SUCCESS
			function onSuccess(oData, response) {

				// Disable Busy Indicator
				oJsonModel.setProperty("/BusyControl/Chart01", false);

				// Refresh Chart Content (BlockUsers)
				oJsonModel.setProperty("/ChartData/BlockUsers", oData.results);

			}

			// Callback para ERROR
			function onError(oError) {

				// Disable Busy Indicator
				oJsonModel.setProperty("/BusyControl/Chart01", false);

				MessageBox.alert("Erro on path '/BlockUsers' :" + oError.responseText);

			}

			// Parameters
			var oParam = {

				// CallBack para Sucesso
				success: onSuccess.bind(this),
				error: onError.bind(this)

			};

			// Refresh Chart Content (BlockUsers)
			var oTemp = [];
			oJsonModel.setProperty("/ChartData/BlockUsers", oTemp);

			// Enable Busy Indicator
			oJsonModel.setProperty("/BusyControl/Chart01", true);

			// Get BlockUsers Content
			oDataModel.read("/BlockUsers", oParam);

		},

		/*----------------------------------------------------
		Function: _getDataBlockSystems
		Target: Get Data from BlockSystems EntitySet
		----------------------------------------------------*/
		_getDataBlockSystems: function (oDataModel, oJsonModel) {

			// Callback para SUCCESS
			function onSuccess(oData, response) {

				// Temporary Array
				var oTempArray = [];

				// Disable Busy Indicator
				oJsonModel.setProperty("/BusyControl/Chart02", false);

				// Run All Itens Returned
				for (var i = 0; i < oData.results.length; i++) {

					// Include Empty Records
					if (oJsonModel.getProperty("/Settings/includeEmptySystems"))
						oTempArray = oData.results;
					else {
						var _qtyCurrent = Number(oData.results[i].Qty);
						if (_qtyCurrent !== 0)
							oTempArray.push(oData.results[i]);
					}
				}

				// Update Content
				oJsonModel.setProperty("/ChartData/BlockSystems", oTempArray);

			}

			// Callback para ERROR
			function onError(oError) {

				// Disable Busy Indicator
				oJsonModel.setProperty("/BusyControl/Chart02", false);
				oJsonModel.setProperty("/BusyControl/Chart03", false);

				MessageBox.alert("Erro on path '/BlockSystems' :" + oError.responseText);

			}

			// Parameters
			var oParam = {

				// CallBack para Sucesso
				success: onSuccess.bind(this),
				error: onError.bind(this)

			};

			// Refresh Chart Content (BlockSystems)
			var oTemp = [];
			oJsonModel.setProperty("/ChartData/BlockSystems", oTemp);

			// Enable Busy Indicator
			oJsonModel.setProperty("/BusyControl/Chart02", true);
			oJsonModel.setProperty("/BusyControl/Chart03", true);

			// Get BlockSystems Content
			oDataModel.read("/BlockSystems", oParam);

		},

		/*----------------------------------------------------
		Function: _getDataSystemsConfigs
		Target: Get Data from EntitySet
		----------------------------------------------------*/
		_getDataSystemsConfigs: function (oDataModel, oJsonModel) {

			// CallBack para Sucesso
			function onSuccess(oData, response) {
				oJsonModel.setProperty("/InfoSystemConfig", oData.results);
			}

			// CallBack para Erro
			function onError(oError) {
				MessageBox.alert("Erro na pesquisa dos dados da EntitySet '/SystemConfigs' :" + oError.responseText);

			}

			//----------------------------
			// Read Data from "/SystemConfigs" Entity Set
			//----------------------------
			var oParam_QUERY = {

				// CallBack para Sucesso
				success: onSuccess,
				error: onError

			};

			// Refresh Chart Content (InfoSystemConfig)
			var oTemp = [];
			oJsonModel.setProperty("/InfoSystemConfig", oTemp);

			// Call QUERY on Entity Set Import on SAP Gateway
			oDataModel.read("/SystemConfigs", oParam_QUERY);

		},

		/*----------------------------------------------------
		Function: _getChartData
		Target: Function to get chart Data from Odata Model
		----------------------------------------------------*/
		_getChartData: function () {

			// Get Default Model from View (OData and JSONModel)
			var oDataModel = this.getView().getModel();
			var oJsonModel = this.getView().getModel("Chart");
			oJsonModel.setProperty("/Settings/lastDateTime", new Date().toLocaleString());

			// Get Data BlockUsers EntitySet
			this._getDataBlockUsers(oDataModel, oJsonModel);

			// Get Data BlockSystems EntitySet
			this._getDataBlockSystems(oDataModel, oJsonModel);

			// Get Data SystemConfigs EntitySet
			this._getDataSystemsConfigs(oDataModel, oJsonModel);

		}

	});
});
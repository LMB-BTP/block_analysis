/*global QUnit*/

sap.ui.define([
	"LMBR_CUSTOMER_APP/block_analysis/controller/V0.controller"
], function (Controller) {
	"use strict";

	QUnit.module("V0 Controller");

	QUnit.test("I should test the V0 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
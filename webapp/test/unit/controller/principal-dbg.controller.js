/*global QUnit*/

sap.ui.define([
	"arrgestionreclamorasa/arrgestionreclamorasa/controller/principal.controller"
], function (Controller) {
	"use strict";

	QUnit.module("principal Controller");

	QUnit.test("I should test the principal controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
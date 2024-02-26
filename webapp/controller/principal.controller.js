sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (Controller, Button, Dialog, List, StandardListItem, Text, mobileLibrary, IconPool, JSONModel, SimpleType, ValidateException) {
	// "use strict";
	var oView, oSAPuser, t, Button, Dialog, oSelectedItem, data, a, oSelectedItem2, codsucursal, Ecamino;
	return Controller.extend("arrgestionreclamorasa.arrgestionreclamorasa.controller.principal", {
		onInit: function () {
			t = this;
			oView = this.getView();
			//Sentencia para minimizar contenido
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType : "json",
				url:appModulePath + "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					oSAPuser = dataR.name;
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			t.leerUsuario(oSAPuser);
			t.ConsultaSolicitante();
			t.Consulta2();
			t.ConsultaEstados();
			t.ConsultaOdata();
			t.ConsultaTiposReclamos();
			
		},
		leerUsuario: function (oSAPuser) {
			var flagperfil = true;
			var url = '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
			//Consulta
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					for (var i = 0; i < dataR.groups.length; i++) {
						if (dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"] === undefined) {
						var custom = "";
					} else {
						var custom = dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes;
					}

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {
							flagperfil = false;
							for (var x = 0; x < custom.length; x++) {
								if (custom[x].name === "customAttribute6") {
									codsucursal = custom[x].value;
								}
							}
						}
					}

					if (!flagperfil) {
						// codsucursal = dataR.company;
						oView.byId("dealer").setSelectedKey("0000" + codsucursal);
						oView.byId("dealer").setEditable(false);
					} else {
						oView.byId("dealer").setEditable(true);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});
		},
		validarcant: function () {
			if (oView.byId("Products").getValue().toString().length >= 4) {
				t.ConsultaMaterial();
			}
		},
		
		ConsultaTiposReclamos: function(){
			//Consulta
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				url: appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/TiposReclamos',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					dataR.d.results.push({ID:"", DESCRIPCION: ""});
					var tiposReclamos = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(tiposReclamos, "tiposReclamos");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		APRUEBA: function () {
			t.cerrarpopConsulta();
			var arr = [];
			var json2;
			var json = oView.getModel("Reclamos").oData;

			var id_reclamo = json[oSelectedItem2].ID_RECLAMO;
			var NROPIEZA = json[oSelectedItem2].NROPIEZA;
			var url = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/Reclamos(ID_RECLAMO=' + id_reclamo + ",NROPIEZA=%27" +
				NROPIEZA + '%27)';
			var obj = {
				ID_RECLAMO: json[oSelectedItem2].ID_RECLAMO,
				ID_DEALER: json[oSelectedItem2].ID_DEALER,
				FECHA: json[oSelectedItem2].FECHA,
				ENTREGA: json[oSelectedItem2].ENTREGA,
				REMITOLEGAL: json[oSelectedItem2].REMITOLEGAL,
				FECHAREMITO: json[oSelectedItem2].FECHAREMITO,
				PEDIDOWEB: json[oSelectedItem2].PEDIDOWEB,
				PEDIDODEALER: json[oSelectedItem2].PEDIDODEALER,
				TIPOPEDIDO: json[oSelectedItem2].TIPOPEDIDO,
				NROPIEZA: json[oSelectedItem2].NROPIEZA,
				DESCRIPCION: json[oSelectedItem2].DESCRIPCION,
				CANTFACTURADA: json[oSelectedItem2].CANTFACTURADA,
				CANTRECLAMADA: json[oSelectedItem2].CANTRECLAMADA,
				FACTURASAP: json[oSelectedItem2].FACTURASAP,
				FACTURALEGAL: json[oSelectedItem2].FACTURALEGAL,
				FECHAFACTURADA: json[oSelectedItem2].FECHAFACTURADA,
				ID_MOTIVO: json[oSelectedItem2].ID_MOTIVO,
				COMENTARIODEALER: json[oSelectedItem2].COMENTARIODEALER,
				COMENTARIONISSAN: oView.byId("f1").getValue(),
				ID_EDO_REC: "03",
				ID_NOTA_ENTREGA: json[oSelectedItem2].ID_NOTA_ENTREGA,
				ID_USUARIO_CREACION: json[oSelectedItem2].ID_USUARIO_CREACION,
				ID_USUARIO_GESTION: oSAPuser,
				FECHA_ACTUALIZACION: "\/Date(" + new Date().getTime() + ")\/",
				NOTA_CREDITO: null,
				CANT_INTENTOS: null,
				RESPUESTA: null
			};
			json2 = JSON.stringify(obj);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'PUT',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: json2,
				success: function (data, textStatus, jqXHR) {
					//	console.log(data);
					if (data === undefined) {
						//	t.cerrarPopCarga2();
						var obj = {
							codigo: "200",
							descripcion: "Reclamo Aprobado correctamente"
						};
						arr.push(obj);

						t.popSucces(arr, "Aprobado");
						t.limpieza();
						t.Consulta();
						t.cerrarpopDetalle();
					}

				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},

		poprechazo: function () {
			Ecamino = 1;
			var arr = [];
			var obj = {
				codigo: "",
				descripcion: "¿Desea Rechazar este Reclamo?"
			};
			arr.push(obj);

			t.popConsulta(arr, "Rechazo de Reclamo");
		},
		popapruebo: function () {
			Ecamino = 2;
			var arr = [];
			var obj = {
				codigo: "",
				descripcion: "¿Desea Aprobar este Reclamo?"
			};
			arr.push(obj);

			t.popConsulta(arr, "Aprobación de Reclamo");
		},
		camino: function () {
			if (Ecamino === 1) {
				t.Rechazo();
			} else {
				t.APRUEBA();
			}
			Ecamino = "";
		},
		Rechazo: function () {
			t.cerrarpopConsulta();
			var arr = [];
			var json2;
			var json = oView.getModel("Reclamos").oData;
			// json[oSelectedItem2].REMITOLEGAL;
			var id_reclamo = json[oSelectedItem2].ID_RECLAMO;
			var NROPIEZA = json[oSelectedItem2].NROPIEZA;
			// ID_RECLAMO=169,NROPIEZA='26010EM00A'
			var url = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/Reclamos(ID_RECLAMO=' + id_reclamo + ",NROPIEZA=%27" +
				NROPIEZA + '%27)';
			var obj = {
				ID_RECLAMO: json[oSelectedItem2].ID_RECLAMO,
				ID_DEALER: json[oSelectedItem2].ID_DEALER,
				FECHA: json[oSelectedItem2].FECHA,
				ENTREGA: json[oSelectedItem2].ENTREGA,
				REMITOLEGAL: json[oSelectedItem2].REMITOLEGAL,
				FECHAREMITO: json[oSelectedItem2].FECHAREMITO,
				PEDIDOWEB: json[oSelectedItem2].PEDIDOWEB,
				PEDIDODEALER: json[oSelectedItem2].PEDIDODEALER,
				TIPOPEDIDO: json[oSelectedItem2].TIPOPEDIDO,
				NROPIEZA: json[oSelectedItem2].NROPIEZA,
				DESCRIPCION: json[oSelectedItem2].DESCRIPCION,
				CANTFACTURADA: json[oSelectedItem2].CANTFACTURADA,
				CANTRECLAMADA: json[oSelectedItem2].CANTRECLAMADA,
				FACTURASAP: json[oSelectedItem2].FACTURASAP,
				FACTURALEGAL: json[oSelectedItem2].FACTURALEGAL,
				FECHAFACTURADA: json[oSelectedItem2].FECHAFACTURADA,
				ID_MOTIVO: json[oSelectedItem2].ID_MOTIVO,
				COMENTARIODEALER: json[oSelectedItem2].COMENTARIODEALER,
				COMENTARIONISSAN: oView.byId("f1").getValue(),
				ID_EDO_REC: "02",
				ID_NOTA_ENTREGA: json[oSelectedItem2].ID_NOTA_ENTREGA,
				ID_USUARIO_CREACION: json[oSelectedItem2].ID_USUARIO_CREACION,
				ID_USUARIO_GESTION: oSAPuser,
				FECHA_ACTUALIZACION: "\/Date(" + new Date().getTime() + ")\/",
				NOTA_CREDITO: null,
				CANT_INTENTOS: null,
				RESPUESTA: null
			};
			json2 = JSON.stringify(obj);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'PUT',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: json2,
				success: function (data, textStatus, jqXHR) {
					//	console.log(data);
					if (data === undefined) {
						var obj = {
							codigo: "200",
							descripcion: "Reclamo Rechazado correctamente"
						};
						arr.push(obj);

						t.popError(arr, "Rechazado");
						t.limpieza();
						t.Consulta();
						t.cerrarpopDetalle();
						//	t.CerrarModificar();
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		limpieza: function () {
			oView.byId("f1").setValue();
		},
		limpiezaBusqueda: function () {
			oView.byId("dealer").setSelectedKey();
			oView.byId("Nreclamo").setValue();
			oView.byId("Factura").setValue();
			oView.byId("Entrega").setValue();
			oView.byId("FechaCreacion").setValue();
			oView.byId("cmbMotivo").setSelectedKey();

		},

		ConsultaSolicitante: function () {

			var UrlSolicitante = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/solicitante';
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath + UrlSolicitante,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var cliente = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(cliente, "cliente");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		prueba: function () {
			console.log(oView.byId("cmbMotivo").getValue())
			console.log(oView.byId("cmbMotivo").getSelectedKey())
		},
		Consulta: function () {

			var arr = [];

			if ((oView.byId("FechaCreacion").getValue() === null || oView.byId("FechaCreacion").getValue() === "") && oView.byId("Nreclamo").getValue() ===
				"" && oView.byId("Factura").getValue() === "" && oView.byId("Entrega").getValue() === "") {
				var obj3 = {
					codigo: "06",
					descripcion: "Debe Seleccionar  un rango de fecha, Factura , Nro Reclamo o Entrega"
				};
				arr.push(obj3);

				t.popError(arr, "Error en busqueda");

			} else {

				var semanaEnMilisegundos = (1000 * 60 * 60 * 24 * 90);
				var hoy = new Date() - semanaEnMilisegundos;

				hoy = new Date(hoy).toISOString().slice(0, 10);
				var desde = oView.byId("FechaCreacion").getDateValue();
				var hasta = oView.byId("FechaCreacion").getSecondDateValue();
				console.log(oView.byId("FechaCreacion").getValue());

				if (oView.byId("FechaCreacion").getValue() === "") {
					desde = "";
					hasta = "";
				} else {
					desde = new Date(desde).toISOString().slice(0, 10);
					hasta = new Date(hasta).toISOString().slice(0, 10);
				}
				// if (desde < hoy) {
				// 	var obj2 = {
				// 		codigo: "200",
				// 		descripcion: "El rango de busqueda no puede ser mayor a 3 meses"
				// 	};
				// 	arr.push(obj2);

				// 	t.popError(arr, "Rechazado");

				// } else {
				var recl, fac, ent, mot, con, fechdes, fechast, dealer2;
				var dealer = "";
				var Nreclamo = "";
				var Factura = "";
				var Entrega = "";
				var Motivo = "";
				var tipoReclamo;
				dealer = oView.byId("dealer").getSelectedKey();
				Nreclamo = oView.byId("Nreclamo").getValue();
				Factura = oView.byId("Factura").getValue();
				Entrega = oView.byId("Entrega").getValue();
				Motivo = oView.byId("cmbMotivo").getSelectedKey();
				//tipoReclamo = oView.byId("TipoReclamo").getSelectedKey();
				
				var consulta = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/ViewReclamos?$filter=';
				con = '%20and%20';
				recl = 'ID_RECLAMO%20eq%20' + Nreclamo;
				fac = 'FACTURASAP%20eq%20%27' + Factura + '%27';
				ent = 'ENTREGA%20eq%20%27' + Entrega + '%27';
				mot = 'ID_MOTIVO%20eq%20%27' + Motivo + '%27';
				dealer2 = 'ID_DEALER%20eq%20%27' + dealer + '%27';
				var fecha = 'FECHA%20ge%20datetime%27' + desde + 'T00:00:00.0000000%27%20and%20FECHA%20le%20datetime%27' + hasta +
					'T23:00:00.0000000%27';
				if (oView.byId("Nreclamo").getValue() !== "" && consulta ===
					"/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/ViewReclamos?$filter=") {
					console.log("re1")
					consulta = consulta + recl;
				} else if (oView.byId("Nreclamo").getValue() !== "") {
					console.log("re2")
					consulta = consulta + con + recl;
				}
				if (oView.byId("Factura").getValue() !== "" && consulta ===
					"/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/ViewReclamos?$filter=") {
					console.log("f1")
					consulta = consulta + fac;
				} else if (oView.byId("Factura").getValue() !== "") {
					console.log("f2")
					consulta = consulta + con + fac;
				}
				if (oView.byId("Entrega").getValue() !== "" && consulta ===
					"/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/ViewReclamos?$filter=") {
					console.log("E1")
					consulta = consulta + ent;
				} else if (oView.byId("Entrega").getValue() !== "") {
					console.log("E2")
					consulta = consulta + con + ent;
				}
				if (oView.byId("FechaCreacion").getValue() !== "" && consulta ===
					"/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/ViewReclamos?$filter=") {
					console.log("fe1")
					consulta = consulta + fecha;
				} else if (oView.byId("FechaCreacion").getValue() !== "") {
					console.log("fe2")
					consulta = consulta + con + fecha;
				}

				if (oView.byId("cmbMotivo").getValue() !== "") {
					consulta = consulta + con + mot;
				}
				if (oView.byId("dealer").getSelectedKey() !== "") {
					consulta = consulta + con + dealer2;

				}
				if (tipoReclamo) {
					consulta = consulta + con + 'ID_TIPO_RECLAMO%20eq%20' + tipoReclamo;
				}
				

				consulta = consulta + con + 'ID_EDO_REC%20eq%20%2701%27';

				var color, ncolor, arr3 = [],
					DESTIPOPEDIDO;
				console.log(consulta);
				//Consulta
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
				$.ajax({
					type: 'GET',
					url:appModulePath + consulta,
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					success: function (dataR, textStatus, jqXHR) {
						var json = dataR.d.results;
						var Nombre_dealer;
						var json9 = oView.getModel("cliente").oData;
						console.log(json9);

						for (var i = 0; i < json.length; i++) {
							for (var a = 0; a < json9.length; a++) {
								if (json9[a].SOLICITANTE === json[i].ID_DEALER) {
									Nombre_dealer = json9[a].NOMBRE_SOLICITANTE;
								}
							}

							if (Number(json[i].ID_EDO_REC) === 1) {

								color = 'sap-icon://status-critical';
								ncolor = '#ffbc05';
							}
							if (Number(json[i].ID_EDO_REC) === 2) {
								color = 'sap-icon://status-negative';
								ncolor = '#e30000'
							}
							if (Number(json[i].ID_EDO_REC, 10) === 3) {
								color = 'sap-icon://status-positive';
								ncolor = '#00c753';
							}
							//convertir clase
							if (json[i].TIPOPEDIDO === "YNCI") {
								DESTIPOPEDIDO = "Pedido Inmovilizado";
							}
							if (json[i].TIPOPEDIDO === "YNCS") {
								DESTIPOPEDIDO = "Pedido Stock";
							}
							if (json[i].TIPOPEDIDO === "YNCU") {
								DESTIPOPEDIDO = "Pedido Urgente";
							}
							if (json[i].TIPOPEDIDO === "YNPI") {
								DESTIPOPEDIDO = "Pedido Interno";
							}

							var json5 = {
								"ID_RECLAMO": json[i].ID_RECLAMO,
								"ID_DEALER": json[i].ID_DEALER,
								"Nombre_dealer": Nombre_dealer,
								"FECHA": json[i].FECHA,
								"ENTREGA": json[i].ENTREGA,
								"REMITOLEGAL": json[i].REMITOLEGAL,
								"FECHAREMITO": json[i].FECHAREMITO,
								"PEDIDOWEB": json[i].PEDIDOWEB,
								"PEDIDODEALER": json[i].PEDIDODEALER,
								"TIPOPEDIDO": json[i].TIPOPEDIDO,
								"NROPIEZA": json[i].NROPIEZA,
								"DESCRIPCION": json[i].DESCRIPCION,
								"CANTFACTURADA": json[i].CANTFACTURADA,
								"CANTRECLAMADA": json[i].CANTRECLAMADA,
								"FACTURASAP": json[i].FACTURASAP,
								"FACTURALEGAL": json[i].FACTURALEGAL,
								"FECHAFACTURADA": json[i].FECHAFACTURADA,
								"ID_MOTIVO": json[i].ID_MOTIVO,
								"COMENTARIODEALER": json[i].COMENTARIODEALER,
								"COMENTARIONISSAN": json[i].COMENTARIONISSAN,
								"ID_EDO_REC": json[i].ID_EDO_REC,
								"ID_NOTA_ENTREGA": json[i].ID_NOTA_ENTREGA,
								"ID_USUARIO_CREACION": json[i].ID_USUARIO_CREACION,
								"ID_USUARIO_GESTION": json[i].ID_USUARIO_GESTION,
								"COL": json[i].COL,
								"DESTIPOPEDIDO": DESTIPOPEDIDO,
								"FECHA_CREACION": json[i].FECHA_CREACION,
								"color": color,
								"ncolor": ncolor,
								"FECHA_ACTUALIZACION": json[i].FECHA_ACTUALIZACION_N
							};
							arr3.push(json5);
						}
						console.log(arr3);
						var Reclamos = new sap.ui.model.json.JSONModel(arr3);
						oView.setModel(Reclamos, "Reclamos");

						console.log(dataR);

					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log(JSON.stringify(jqXHR));
					}
				});
			}
			//	}

		},
		Consulta2: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata';
			$.ajax({
				type: 'GET',
				url:appModulePath + consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					console.log(dataR);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});

		},
		InfoDetalle: function (oEvent) {
			oSelectedItem2 = oEvent.getSource().getParent().getBindingContext("Reclamos").sPath;
			oSelectedItem2 = oSelectedItem2.replace(/\//g, "");

			t.popDetalle();

		},
		ConsultaOdata: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var region = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/motivosReclamos';
			console.log(region);
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath + region,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					dataR.d.results.unshift({ID_MOTIVO:"", DESCRIPCION: ""});
					var tReclamo = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(tReclamo, "reclamos");
				},
				error: function (jqXHR, textStatus, errorThrown) {
				}
			});
		},
		CargarDatos: function () {
			let dfdCargaDatos = $.Deferred();
			
			var json = oView.getModel("Reclamos").oData;
			var json2 = oView.getModel("reclamos").oData;

			oView.byId("tituloPanel").setText("Fecha de Creación :  " + json[oSelectedItem2].FECHA_CREACION);
			oView.byId("a1").setText(json[oSelectedItem2].ENTREGA);
			oView.byId("a2").setText(json[oSelectedItem2].PEDIDOWEB);
			oView.byId("a3").setText(json[oSelectedItem2].NROPIEZA);
			oView.byId("a4").setText(json[oSelectedItem2].CANTRECLAMADA);
			oView.byId("a5").setSelectedKey(json[oSelectedItem2].ID_EDO_REC);
			//b
			oView.byId("b1").setText(json[oSelectedItem2].REMITOLEGAL);
			oView.byId("b2").setText(json[oSelectedItem2].PEDIDODEALER);
			oView.byId("b3").setText(json[oSelectedItem2].DESCRIPCION);
			oView.byId("b4").setText(json[oSelectedItem2].FACTURASAP);
			oView.byId("b5").setText(json[oSelectedItem2].FECHAFACTURADA);
			//c
			oView.byId("c1").setText(json[oSelectedItem2].FECHAREMITO);
			oView.byId("c2").setText(json[oSelectedItem2].TIPOPEDIDO);
			oView.byId("c3").setText(json[oSelectedItem2].CANTFACTURADA);
			oView.byId("c4").setText(json[oSelectedItem2].FACTURALEGAL);
			oView.byId("c5").setText(json[oSelectedItem2].FECHA_ACTUALIZACION);
			//d
			oView.byId("d1").setValue(json[oSelectedItem2].COMENTARIODEALER);

			//
			for (var x = 0; x < json2.length; x++) {
				if (json2[x].ID_MOTIVO === json[oSelectedItem2].ID_MOTIVO) {
					oView.byId("e1").setValue(json2[x].DESCRIPCION);
				}
			}

			//f
			oView.byId("f1").setValue(json[oSelectedItem2].COMENTARIONISSAN);

			if (Number(json[oSelectedItem2].ID_EDO_REC) === 1) {
				oView.byId("f1").setEditable(true);
				oView.byId("btnAprueba").setVisible(true);
				oView.byId("btnRechaza").setVisible(true);

			} else {

				oView.byId("btnAprueba").setVisible(false);
				oView.byId("btnRechaza").setVisible(false);
				oView.byId("f1").setEditable(false);

			}
			
			this.cargarFotos(json[oSelectedItem2].ID_RECLAMO).then(dfdCargaDatos.resolve);
			
			return dfdCargaDatos;
		},
		cargarFotos: function(idReclamo){
			let dfdFotos = $.Deferred();
			let filtro = "?$filter=ID_RECLAMO eq " + idReclamo;
			var button = oView.byId("ButtonPhoto");
			var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				url:appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/Foto' + filtro,
				type: 'GET',
				contentType: 'application/json',
				dataType: 'json',
				success: function (dataR, textStatus, jqXHR) {
					debugger;
					let fotosModel = new sap.ui.model.json.JSONModel(dataR.d.results);
					//Fix de Reclamo en caso de no tener foto
					if(dataR.d.results.length == 0){
						fotosModel = undefined;
						button.setEnabled(false);
						button.setText("Visualizar (0)");
						//button.setType("Negative");	
					}
					
					oView.setModel(fotosModel, "Fotos");
					
					dfdFotos.resolve();
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
			
			return dfdFotos;
		},
		openDialogFotos:function(){
			var oDialog = oView.byId("Fotos");
			
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.Fotos", this);
				oView.addDependent(oDialog);
			}
			oView.byId("Fotos").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
		},
		closeDialogFotos: function(){
			oView.byId("Fotos").close();
		},

		ConsultaEstados: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var estados = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/estadoRepuesto';
			console.log(estados);
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath + estados,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					console.log(dataR);

					var estado = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(estado, "estado");

				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		popCarga: function () {

			var oDialog = oView.byId("indicadorCarga");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		},
		Modificar: function (oEvent) {
			//INICIO
			oSelectedItem = oEvent.getSource().getParent();
			mod = oSelectedItem.sId.toString().substring(oSelectedItem.sId.length - 1, oSelectedItem.sId.length);
			//FIN
			//	t.cerrarpopmalos();
			var oDialog = oView.byId("GReclamo");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.Modificar", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		CerrarModificar: function () {
			oView.byId("GReclamo").close();

		},
		popSucces: function (obj, titulo) {
			var oDialog = oView.byId("dialogSucces");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.Succes", this);
				oView.addDependent(oDialog);
			}
			oView.byId("dialogSucces").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("dialogSucces").setTitle("Succes: " + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSucces: function () {
			oView.byId("dialogSucces").close();

		},
		popConsulta: function (obj, titulo) {
			var oDialog = oView.byId("consulta");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.consulta", this);
				oView.addDependent(oDialog);
			}
			oView.byId("consulta").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("consulta").setTitle("" + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarpopConsulta: function () {
			oView.byId("consulta").close();

		},
		popDetalle: function () {
			var oDialog = oView.byId("Detalle");

			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.Detalle", this);
				oView.addDependent(oDialog);
			}
			oView.byId("Detalle").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			t.CargarDatos().then(function(){
				oDialog.open();
			});
		},
		cerrarpopDetalle: function () {
			oView.byId("Detalle").close();

		},
		popError: function (obj, titulo) {
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "error");
			var oDialog = oView.byId("dialogError");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "arrgestionreclamorasa.arrgestionreclamorasa.view.Error", this);
				oView.addDependent(oDialog);
			}
			oView.byId("dialogError").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("dialogError").setTitle("Error: " + titulo);
			//	oView.byId("dialogError").setState("Error");
		},
		cerrarPopError: function () {
			oView.byId("dialogError").close();

		},
		onSalir: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},
		ModificaComentarios: function () {
			// t.cerrarpopConsulta();
			var arr = [];
			var json2;
			var json = oView.getModel("Reclamos").oData;

			var id_reclamo = json[oSelectedItem2].ID_RECLAMO;
			var NROPIEZA = json[oSelectedItem2].NROPIEZA;
			var url = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/Reclamos(ID_RECLAMO=' + id_reclamo + ",NROPIEZA=%27" +
				NROPIEZA + '%27)';
			var obj = {
				ID_RECLAMO: json[oSelectedItem2].ID_RECLAMO,
				ID_DEALER: json[oSelectedItem2].ID_DEALER,
				FECHA:json[oSelectedItem2].FECHA,
				ENTREGA: json[oSelectedItem2].ENTREGA,
				REMITOLEGAL: json[oSelectedItem2].REMITOLEGAL,
				FECHAREMITO: json[oSelectedItem2].FECHAREMITO,
				PEDIDOWEB: json[oSelectedItem2].PEDIDOWEB,
				PEDIDODEALER: json[oSelectedItem2].PEDIDODEALER,
				TIPOPEDIDO: json[oSelectedItem2].TIPOPEDIDO,
				NROPIEZA: json[oSelectedItem2].NROPIEZA,
				DESCRIPCION: json[oSelectedItem2].DESCRIPCION,
				CANTFACTURADA: json[oSelectedItem2].CANTFACTURADA,
				CANTRECLAMADA: json[oSelectedItem2].CANTRECLAMADA,
				FACTURASAP: json[oSelectedItem2].FACTURASAP,
				FACTURALEGAL: json[oSelectedItem2].FACTURALEGAL,
				FECHAFACTURADA: json[oSelectedItem2].FECHAFACTURADA,
				ID_MOTIVO: json[oSelectedItem2].ID_MOTIVO,
				COMENTARIODEALER: json[oSelectedItem2].COMENTARIODEALER,
				COMENTARIONISSAN: oView.byId("f1").getValue(),
				ID_EDO_REC: json[oSelectedItem2].ID_EDO_REC,
				ID_NOTA_ENTREGA: json[oSelectedItem2].ID_NOTA_ENTREGA,
				ID_USUARIO_CREACION: json[oSelectedItem2].ID_USUARIO_CREACION,
				ID_USUARIO_GESTION: oSAPuser,
				FECHA_ACTUALIZACION: "\/Date(" + new Date().getTime() + ")\/",
				NOTA_CREDITO: null,
				CANT_INTENTOS: null,
				RESPUESTA: null
			};
			console.log(obj);
			json2 = JSON.stringify(obj);
			console.log(json2);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'PUT',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: json2,
				success: function (data, textStatus, jqXHR) {
					//	console.log(data);
					if (data === undefined) {
						//	t.cerrarPopCarga2();
						var obj = {
							codigo: "200",
							descripcion: "Reclamo Modificado correctamente"
						};
						arr.push(obj);

						t.popSucces(arr, "Aprobado");
						t.limpieza();
						t.Consulta();
						t.cerrarpopDetalle();
					}

				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		}

	});
});
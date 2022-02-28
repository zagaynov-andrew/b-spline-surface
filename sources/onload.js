// 2.js

"use strict";

// Vertex shader program
const VSHADER_SOURCE =
	'attribute	vec4	a_Position;\n' +
	'attribute	float	a_select;\n' +
	'attribute	vec4	a_normal;\n' +
	'uniform	mat4	u_mvpMatrix;\n' +
	'uniform	float	u_pointSize;\n' +
	'uniform	float	u_pointSizeSelect;\n' +
	'uniform	vec4	u_color;\n' +
	'uniform	vec4	u_colorSelect;\n' +
	'varying	vec4	v_color;\n' +
	'varying	vec4	v_normal;\n' +
	'varying	vec4	v_position;\n' +
	'void main() {\n' +
	'  gl_Position = u_mvpMatrix * a_Position;\n' +
	'  if (a_select != 0.0)\n' +
	'  {\n' +
	'    v_color = u_colorSelect;\n' +
	'    gl_PointSize = u_pointSizeSelect;\n' +
	'  }\n' +
	'  else\n' +
	'  {\n' +
	'    v_color = u_color;\n' +
	'    gl_PointSize = u_pointSize;\n' +
	'  }\n' +
	'  v_normal = a_normal;\n' +
	'  v_position = a_Position;\n' +
	'}\n';

// Fragment shader program
const FSHADER_SOURCE =
	'precision	mediump	float;\n' +
	'varying	vec4	v_color;\n' +
	'varying	vec4	v_normal;\n' +
	'varying	vec4	v_position;\n' +
	'uniform	bool	u_drawPolygon;\n' +
	'uniform	vec3	u_LightColor;\n' +     // Light color
	'uniform	vec4	u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
	'uniform	vec3	u_AmbientLight;\n' +   // Color of an ambient light
	'uniform	vec3	u_colorAmbient;\n' +
	'uniform	vec3	u_colorSpec;\n' +
	'uniform	float	u_shininess;\n' +
	'void main() {\n' +
	'  if (u_drawPolygon) {\n' +
	// Make the length of the normal 1.0
	'    vec3 normal =  normalize(gl_FrontFacing ? v_normal.xyz : -v_normal.xyz);\n' +
	// Calculate the light direction and make it 1.0 in length
	'    vec3 lightDirection = normalize(vec3(u_LightPosition - v_position));\n' +
	// Dot product of the light direction and the orientation of a surface (the normal)
	'    float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
	// Calculate the color due to diffuse reflection
	'    vec3 diffuse = u_LightColor * v_color.rgb * nDotL;\n' +
	// Calculate the color due to ambient reflection
	'    vec3 ambient = u_AmbientLight * u_colorAmbient;\n' +
	'    vec3 r = reflect( -lightDirection, normal );\n' +
	'    vec3 spec = vec3(0.0);\n' +
	'    if( nDotL > 0.0 )\n' +
	'      spec = u_LightColor * u_colorSpec *\n' +
	'             pow( max( dot(r,lightDirection), 0.0 ), u_shininess );\n' +
	'    \n' +
	// Add the surface colors due to diffuse reflection and ambient reflection
	'    gl_FragColor = vec4(spec + diffuse + ambient, v_color.a);\n' +
	'  } else {\n' +
	'    gl_FragColor = v_color;\n' +
	'  }\n' +
	'}\n';

function main() {
	// Retrieve <canvas> element
	const canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	const gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	const viewport = [0, 0, canvas.width, canvas.height];
	gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);

	const Xmin  = document.getElementById("Xmin");
	const Xmax  = document.getElementById("Xmax");
	const Ymin  = document.getElementById("Ymin");
	const Ymax  = document.getElementById("Ymax");
	const Z     = document.getElementById("Z");
	const N_ctr = document.getElementById("N_ctr");
	const M_ctr = document.getElementById("M_ctr");
	const N     = document.getElementById("N");
	const M     = document.getElementById("M");
	const p     = document.getElementById("p");
	const q     = document.getElementById("q");
	const alpha = document.getElementById("alpha");

	Data.init(gl, viewport, eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value),
		N_ctr, M_ctr, N, M, p, q, alpha);

	canvas.onmousemove = function (ev) { mousemove(ev, canvas); };

	canvas.onmousedown = function (ev) { mousedown(ev, canvas); };

	canvas.onmouseup = function (ev) { mouseup(ev, canvas); };

	(function () {

		function handleMouseWheel(event) {
			event = EventUtil.getEvent(event);
			const delta = EventUtil.getWheelDelta(event);
			Data.mousewheel(delta);
			EventUtil.preventDefault(event);
		}

		EventUtil.addHandler(document, "mousewheel", handleMouseWheel);
		EventUtil.addHandler(document, "DOMMouseScroll", handleMouseWheel);

	})();

	const lineSurfaceSpline = document.getElementById("chkLineSurfaceSpline");
	const controlPolygon = document.getElementById("chkControlPolygon");
	const showControlPoints = document.getElementById("chkShowPoints");
	const visualizeSplineWithPoints = document.getElementById("chkVisualizeWithPoints");
	const visualizeSplineWithLines = document.getElementById("chkVisualizeWithLines");
	const visualizeSplineWithSurface = document.getElementById("chkVisualizeWithSurface");

	lineSurfaceSpline.onclick = function () { Data.plotMode(1); };
	visualizeSplineWithPoints.onclick = function () { Data.plotMode(4); };
	visualizeSplineWithLines.onclick = function () { Data.plotMode(5); };
	visualizeSplineWithSurface.onclick = function () { Data.plotMode(6); };
	showControlPoints.onclick = function () { Data.plotMode(7); };

	Xmin.onchange = function () {
		Data.setDependentGeomParameters(
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	Xmax.onchange = function () {
		Data.setDependentGeomParameters(
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	Ymin.onchange = function () {
		Data.setDependentGeomParameters(
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	Ymax.onchange = function () {
		Data.setDependentGeomParameters(
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	Z.onchange = function () {
		Data.setDependentGeomParameters(
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	N_ctr.onchange = function () {
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	M_ctr.onchange = function () {
		Data.generateControlPoints(N_ctr.value, M_ctr.value,
			eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
	};
	N.onchange = function () { Data.plotMode(2); };
	M.onchange = function () { Data.plotMode(2); };
	p.onchange = function () { Data.plotMode(2); };
	q.onchange = function () { Data.plotMode(2); };
	alpha.onchange = function () { Data.plotMode(0); };
	controlPolygon.onclick = function () { Data.plotMode(3); };

	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.DEPTH_TEST);

	// Specify the color for clearing <canvas>
	gl.clearColor(0.8, 0.8, 0.8, 1.0);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	Data.generateControlPoints(N_ctr.value, M_ctr.value,
		eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
}

function project(obj, mvpMatrix, viewport) {
	const win = vec4.transformMat4(vec4.create(), obj, mvpMatrix);

	if (win[3] === 0.0)
		return;

	win[0] /= win[3];
	win[1] /= win[3];
	win[2] /= win[3];

	win[0] = win[0] * 0.5 + 0.5;
	win[1] = win[1] * 0.5 + 0.5;
	win[2] = win[2] * 0.5 + 0.5;

	win[0] = viewport[0] + win[0] * viewport[2];
	win[1] = viewport[1] + win[1] * viewport[3];

	return win;
}

function unproject(win, modelView, projection, viewport) {

	const invertMV = mat4.invert(mat4.create(), modelView);
	const invertP = mat4.invert(mat4.create(), projection);

	const invertMVP = mat4.multiply(mat4.create(), invertMV, invertP);

	win[0] = (win[0] - viewport[0]) / viewport[2];
	win[1] = (win[1] - viewport[1]) / viewport[3];

	win[0] = win[0] * 2 - 1;
	win[1] = win[1] * 2 - 1;
	win[2] = win[2] * 2 - 1;

	const obj = vec4.transformMat4(vec4.create(), win, invertMVP);

	if (obj[3] === 0.0)
		return;

	obj[0] /= obj[3];
	obj[1] /= obj[3];
	obj[2] /= obj[3];

	return obj;
}

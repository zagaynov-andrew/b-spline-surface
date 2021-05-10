// 2.js

"use strict";

// Vertex shader program
const VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	'attribute float a_select;\n' +
	'attribute vec4 a_normal;\n' +
	'uniform mat4 u_mvpMatrix;\n' +
	'uniform float u_pointSize;\n' +
	'uniform float u_pointSizeSelect;\n' +
	'uniform vec4 u_color;\n' +
	'uniform vec4 u_colorSelect;\n' +
	'varying vec4 v_color;\n' +
	'varying vec4 v_normal;\n' +
	'varying vec4 v_position;\n' +
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
	'precision mediump float;\n' +
	'varying vec4 v_color;\n' +
	'varying vec4 v_normal;\n' +
	'varying vec4 v_position;\n' +
	'uniform bool u_drawPolygon;\n' +
	'uniform vec3 u_LightColor;\n' +     // Light color
	'uniform vec4 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
	'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
	'uniform vec3 u_colorAmbient;\n' +
	'uniform vec3 u_colorSpec;\n' +
	'uniform float u_shininess;\n' +
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

	const Xmin = document.getElementById("Xmin");
	const Xmax = document.getElementById("Xmax");
	const Ymin = document.getElementById("Ymin");
	const Ymax = document.getElementById("Ymax");
	const Z = document.getElementById("Z");
	const N_ctr = document.getElementById("N_ctr");
	const M_ctr = document.getElementById("M_ctr");
	const N = document.getElementById("N");
	const M = document.getElementById("M");
	const p = document.getElementById("p");
	const q = document.getElementById("q");
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

	if (win[3] == 0.0)
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

	if (obj[3] == 0.0)
		return;

	obj[0] /= obj[3];
	obj[1] /= obj[3];
	obj[2] /= obj[3];

	return obj;
}

class Point {
	constructor(x, y, z) {
		this.select = false;
		this.u = 0;
		this.v = 0
		this.x = x;
		this.y = y;
		this.z = z;
		this.winx = 0.0;
		this.winz = 0.0;
		this.winy = 0.0;
	}
	setRect() {
		this.left = this.winx - 5;
		this.right = this.winx + 5;
		this.bottom = this.winy - 5;
		this.up = this.winy + 5;
	}
	calculateWindowCoordinates(mvpMatrix, viewport) {
		const worldCoord = vec4.fromValues(this.x, this.y, this.z, 1.0);

		//------------Get window coordinates of point-----------
		const winCoord = project(worldCoord, mvpMatrix, viewport);
		winCoord[1] = (winCoord[1]); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		this.winx = winCoord[0];
		this.winy = winCoord[1];
		this.winz = winCoord[2];

		this.setRect();//create a bounding rectangle around point
	}
	ptInRect(x, y) {
		const inX = this.left <= x && x <= this.right;
		const inY = this.bottom <= y && y <= this.up;
		return inX && inY;
	}
}


const Camera = {
	//cartesian coordinates
	x0: 0.0,
	y0: 0.0,
	z0: 0.0,
	//spherical coordinates
	r: 0.0,
	theta: 0.0,
	phi: 0.0,
	//initial spherical coordinates
	r_0: 0.0,
	theta_0: 0.0,
	phi_0: 0.0,
	//point the viewer is looking at
	x_ref: 0.0,
	y_ref: 0.0,
	z_ref: 0.0,
	//up vector
	Vx: 0.0,
	Vy: 0.0,
	Vz: 0.0,
	//view volume bounds
	xw_min: 0.0,
	xw_max: 0.0,
	yw_min: 0.0,
	yw_max: 0.0,
	d_near: 0.0,
	d_far: 0.0,
	convertFromCartesianToSpherical: function () {
		const R = this.r + this.r_0;
		const Theta = this.theta + this.theta_0;
		const Phi = this.phi + this.phi_0;

		this.convertFromCartesianToSphericalCoordinates(R, Theta, Phi);

		this.Vx = -R * Math.cos(Theta) * Math.cos(Phi);
		this.Vy = -R * Math.cos(Theta) * Math.sin(Phi);
		this.Vz = R * Math.sin(Theta);

		this.xw_min = -R;
		this.xw_max = R;
		this.yw_min = -R;
		this.yw_max = R;
		this.d_near = 0.0;
		this.d_far = 2 * R;
	},
	convertFromCartesianToSphericalCoordinates: function (r, theta, phi) {
		this.x0 = r * Math.sin(theta) * Math.cos(phi);
		this.y0 = r * Math.sin(theta) * Math.sin(phi);
		this.z0 = r * Math.cos(theta);
	},
	normalizeAngle: function (angle) {
		let lAngle = angle;
		while (lAngle < 0)
			lAngle += 360 * 16;
		while (lAngle > 360 * 16)
			lAngle -= 360 * 16;

		return lAngle;
	},
	getLookAt: function (r, theta, phi) {
		this.r = r;
		this.phi = glMatrix.toRadian(phi / 16.0);
		this.theta = glMatrix.toRadian(theta / 16.0);
		this.convertFromCartesianToSpherical();

		return mat4.lookAt(mat4.create(),
			[Camera.x0, Camera.y0, Camera.z0],
			[Camera.x_ref, Camera.y_ref, Camera.z_ref],
			[Camera.Vx, Camera.Vy, Camera.Vz]);
	},
	getProjMatrix: function () {
		return mat4.ortho(mat4.create(),
			this.xw_min, this.xw_max, this.yw_min, this.yw_max, this.d_near, this.d_far);
	},
	getAxesPoints: function () {
			return [0.5 * this.xw_min, 0, 0,
							this.xw_max, 0, 0,
							0, 0.5 * this.yw_min, 0,
							0, this.yw_max, 0,
							0, 0, -0.5 * (this.d_far - this.d_near) / 2.0,
							0, 0,  (this.d_far - this.d_near) / 2.0];
	},
	getAxesTipLength: function () {
			return 0.2 * (this.d_far - this.d_near);

	}
}

function findSpan(n, k, t, knot_vector)
{
	if (Math.round(t * 1000000) == Math.round(knot_vector[n + 1] * 1000000))
		return n; /* Special case */
	/* Do binary search */
	let low = k;
	let high = n + 1;
	let mid = Math.floor((low + high) / 2);
	while ((t < knot_vector[mid]) || (t >= knot_vector[mid + 1]))
	{
		if (t < knot_vector[mid])
			high = mid;
		else
			low = mid;
		mid = Math.floor((low + high) / 2);
	}
	return mid;
}

function basisFuncs(i, t, k, knot_vector, N)
{
	let left = new Array(k + 1);
	let right = new Array(k + 1);
	let saved, temp;
	N[0] = 1.0;
	for (let j = 1; j <= k; j++)
	{
		left[j] = t - knot_vector[i + 1 - j];
		right[j] = knot_vector[i + j] - t;
		saved = 0.0;
		for (let r = 0; r < j; r++)
		{
			temp = N[r] / (right[r + 1] + left[j - r]);
			N[r] = saved + right[r + 1] * temp;
			saved = left[j - r] * temp;
		}
		N[j] = saved;
	}
	return (N);
}

function surfacePoint(n, p, U, m, q, V, pointsCtr, u, v)
{
	let u_span, v_span;
	let u_ind, v_ind;
	let surface_point = new Point(0, 0, 0);
	let N_u, N_v;

	u_span = findSpan(n, p, u, U);
	N_u = new Array(p + 1);
	basisFuncs(u_span, u, p, U, N_u);

	v_span = findSpan(m, q, v, V);
	N_v = new Array(q + 1);
	basisFuncs(v_span, v, q, V, N_v);

	u_ind = u_span - p;
	v_ind = v_span - q;
	for (let l = 0; l <= q; ++l)
	{
		let temp = new Point(0, 0, 0);
		
		for (let k = 0; k <= p; ++k)
		{
			temp.x += N_u[k] * pointsCtr[u_ind + k][v_ind].x;
			temp.y += N_u[k] * pointsCtr[u_ind + k][v_ind].y;
			temp.z += N_u[k] * pointsCtr[u_ind + k][v_ind].z;
		}
		surface_point.x += N_v[l] * temp.x;
		surface_point.y += N_v[l] * temp.y;
		surface_point.z += N_v[l] * temp.z;
		v_ind++;
	}
	return (surface_point);
}

function dersBasisFuns(i, u, p, n, U, ders)
{
	let j1, j2;
	//------------------------------
	let ndu = new Array(p + 1);
	for (let i = 0; i <= p; ++i)
		ndu[i] = new Array(p + 1);
	let left = new Array(p + 1);
	let right = new Array(p + 1);
	let saved;
	//------------------------------
	ndu[0][0] = 1.0;
	for (let j = 1; j <= p; j++)
	{
		left[j] = u - U[i + 1 - j];
		right[j] = U[i + j] - u;
		saved = 0.0;
		for (let r = 0; r < j; r++)
		{
			ndu[j][r] = right[r + 1] + left[j - r];
			let temp = ndu[r][j - 1] / ndu[j][r];

			ndu[r][j] = saved + right[r + 1] * temp;
			saved = left[j - r] * temp;
		}
		ndu[j][j] = saved;
	}
	for (let j = 0; j <= p; j++)
		ders[0][j] = ndu[j][p];

	//------------------------------
	let a = new Array(p + 1);
	for (let i = 0; i <= p; ++i)
		a[i] = new Array(p + 1);
	//------------------------------
	for (let r = 0; r <= p; r++)
	{
		let s1 = 0, s2 = 1;
		a[0][0] = 1.0;

		for (let k = 1; k <= n; k++)
		{
			let d = 0.0;
			let rk = r - k;
			let pk = p - k;
			if (r >= k)
			{
				a[s2][0] = a[s1][0] / ndu[pk + 1][rk];
				d = a[s2][0] * ndu[rk][pk];
			}
			if (rk >= -1)
				j1 = 1;
			else
				j1 = -rk;
			if (r - 1 <= pk)
				j2 = k - 1;
			else
				j2 = p - r;
			for (let j = j1; j <= j2; j++)
			{
				a[s2][j] = (a[s1][j] - a[s1][j - 1]) / ndu[pk + 1][rk + j];
				d += a[s2][j] * ndu[rk + j][pk];
			}
			if (r <= pk)
			{
				a[s2][k] = -a[s1][k - 1] / ndu[pk + 1][r];
				d += a[s2][k] * ndu[r][pk];
			}
			ders[k][r] = d;
			let j = s1;
			s1 = s2;
			s2 = j;
		}
	}
	let r = p;
	for (let k = 1; k <= n; k++)
	{
		for (let j = 0; j <= p; j++)
			ders[k][j] *= r;
		r *= (p - k);
	}
}

function surfaceDerivs(n, p, U, m, q, V, pointsCtr, u, v, d)
{
	let du = Math.min(d, p);
	let dv = Math.min(d, q);
	let u_span = findSpan(n, p, u, U);
	//------------------------------
	let N_u = new Array(n + 1);
	for (let i = 0; i <= n; ++i)
		N_u[i] = new Array(p + 1);
	//------------------------------
	dersBasisFuns(u_span, u, p, du, U, N_u);
	let v_span = findSpan(m, q, v, V);
	//------------------------------
	let N_v = new Array(m + 1);
	for (let i = 0; i <= m; ++i)
		N_v[i] = new Array(q + 1);
	//------------------------------
	dersBasisFuns(v_span, v, q, dv, V, N_v)


	let deriv_u = new Point(0, 0, 0);
	let deriv_v = new Point(0, 0, 0);

	let temp = new Array(q + 1);
	for (let s = 0; s <= q; ++s)
	{
		temp[s] = new Point(0, 0, 0);
		for (let r = 0; r <= p; ++r)
		{
			temp[s].x += N_u[1][r] * pointsCtr[u_span - p + r][v_span - q + s].x;
			temp[s].y += N_u[1][r] * pointsCtr[u_span - p + r][v_span - q + s].y;
			temp[s].z += N_u[1][r] * pointsCtr[u_span - p + r][v_span - q + s].z;
		}
	}
	for (let i = 0; i <= q; ++i)
	{
		deriv_u.x += N_v[0][i] * temp[i].x;
		deriv_u.y += N_v[0][i] * temp[i].y;
		deriv_u.z += N_v[0][i] * temp[i].z;
	}

	temp = new Array(q + 1);
	for (let s = 0; s <= q; ++s)
	{
		temp[s] = new Point(0, 0, 0);
		for (let r = 0; r <= p; ++r)
		{
			temp[s].x += N_u[0][r] * pointsCtr[u_span - p + r][v_span - q + s].x;
			temp[s].y += N_u[0][r] * pointsCtr[u_span - p + r][v_span - q + s].y;
			temp[s].z += N_u[0][r] * pointsCtr[u_span - p + r][v_span - q + s].z;
		}
	}
	for (let i = 0; i <= q; ++i)
	{
		deriv_v.x += N_v[1][i] * temp[i].x;
		deriv_v.y += N_v[1][i] * temp[i].y;
		deriv_v.z += N_v[1][i] * temp[i].z;
	}
	return [deriv_u, deriv_v];
}

const Data = {
	pointsCtr: [],
	indicesCtr: [],
	indicesAxesTip: [],
	pointsSpline: [],
	indicesSplineLines: [],
	indicesSplineSurface: [],
	normalsSpline: [],
	countAttribData: 4, //x,y,z,sel
	verticesAxes: {},
	verticesCtr: {},
	verticesSpline: {},
	FSIZE: 0,
	ISIZE: 0,
	gl: null,
	vertexBufferAxes: null,
	vertexBufferAxesTip: null,
	indexBufferAxesTip: null,
	vertexBufferCtr: null,
	indexBufferCtr: null,
	vertexBufferSpline: null,
	indexBufferSplineLines: null,
	indexBufferSplineSurface: null,
	verticesAxesTip: {},
	a_Position: -1,
	a_select: -1,
	a_normal: -1,
	u_color: null,
	u_colorSelect: null,
	u_pointSize: null,
	u_pointSizeSelect: null,
	u_drawPolygon: false,
	u_mvpMatrix: null,
	u_LightColor: null,
	u_LightPosition: null,
	u_AmbientLight: null,
	u_colorAmbient: null,
	u_colorSpec: null,
	u_shininess: null,
	movePoint: false,
	iMove: -1,
	jMove: -1,
	leftButtonDown: false,
	drawControlPolygon: false,
	drawLineSurfaceSpline: false,
	showControlPoints: true,
	visualizeSplineWithPoints: true,
	visualizeSplineWithLines: false,
	visualizeSplineWithSurface: false,
	N_ctr: null,
	M_ctr: null,
	N: null,
	M: null,
	p: null,
	q: null,
	alpha: null,
	Xmid: 0.0,
	Ymid: 0.0,
	xRot: 0,
	yRot: 0,
	wheelDelta: 0.0,
	proj: mat4.create(),
	cam: mat4.create(),
	world: mat4.create(),
	viewport: [],
	lastPosX: 0,
	lastPosY: 0,
	nLongitudes: 0,
	nLatitudes: 0,
	init: function (gl, viewport, Xmin, Xmax, Ymin, Ymax, Z, N_ctr, M_ctr, N, M, p, q, alpha) {
		this.gl = gl;
		
		this.verticesAxes = new Float32Array(18); // 6 points * 3 coordinates
		
		// Create a buffer object
		this.vertexBufferAxes = this.gl.createBuffer();
		if (!this.vertexBufferAxes) {
			console.log('Failed to create the buffer object for axes');
			return -1;
		}
		
		this.vertexBufferAxesTip = this.gl.createBuffer();
		if (!this.vertexBufferAxesTip) {
			console.log('Failed to create the buffer object for axes tips');
			return -1;
		}
		
		this.vertexBufferCtr = this.gl.createBuffer();
		if (!this.vertexBufferCtr) {
			console.log('Failed to create the buffer object for control points');
			return -1;
		}
		this.vertexBufferSpline = this.gl.createBuffer();
		if (!this.vertexBufferSpline) {
			console.log('Failed to create the buffer object for spline points');
			return -1;
		}
		
		this.indexBufferAxesTip = this.gl.createBuffer();
		if (!this.indexBufferAxesTip) {
			console.log('Failed to create the index object for axes tips');
			return -1;
		}

		this.indexBufferCtr = this.gl.createBuffer();
		if (!this.indexBufferCtr) {
			console.log('Failed to create the index object for control points');
			return -1;
		}

		this.indexBufferSplineLines = this.gl.createBuffer();
		if (!this.indexBufferSplineLines) {
			console.log('Failed to create the index object for spline lines');
			return -1;
		}

		this.indexBufferSplineSurface = this.gl.createBuffer();
		if (!this.indexBufferSplineSurface) {
			console.log('Failed to create the index object for spline surface');
			return -1;
		}

		this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
		if (this.a_Position < 0) {
			console.log('Failed to get the storage location of a_Position');
			return -1;
		}

		this.a_select = this.gl.getAttribLocation(this.gl.program, 'a_select');
		if (this.a_select < 0) {
			console.log('Failed to get the storage location of a_select');
			return -1;
		}

		this.a_normal = this.gl.getAttribLocation(this.gl.program, 'a_normal');
		if (this.a_normal < 0) {
			console.log('Failed to get the storage location of a_normal');
			return -1;
		}

		// Get the storage location of u_color
		this.u_color = this.gl.getUniformLocation(this.gl.program, 'u_color');
		if (!this.u_color) {
			console.log('Failed to get u_color variable');
			return;
		}

		// Get the storage location of u_colorSelect
		this.u_colorSelect = gl.getUniformLocation(this.gl.program, 'u_colorSelect');
		if (!this.u_colorSelect) {
			console.log('Failed to get u_colorSelect variable');
			return;
		}

		// Get the storage location of u_pointSize
		this.u_pointSize = gl.getUniformLocation(this.gl.program, 'u_pointSize');
		if (!this.u_pointSize) {
			console.log('Failed to get u_pointSize variable');
			return;
		}

		// Get the storage location of u_pointSize
		this.u_pointSizeSelect = gl.getUniformLocation(this.gl.program, 'u_pointSizeSelect');
		if (!this.u_pointSizeSelect) {
			console.log('Failed to get u_pointSizeSelect variable');
			return;
		}

		// Get the storage location of u_drawPolygon
		this.u_drawPolygon = this.gl.getUniformLocation(this.gl.program, 'u_drawPolygon');
		if (!this.u_drawPolygon) {
			console.log('Failed to get u_drawPolygon variable');
			return;
		}

		// Get the storage location of u_LightColor
		this.u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
		if (!this.u_LightColor) {
			console.log('Failed to get u_LightColor variable');
			return;
		}

		// Get the storage location of u_LightPosition
		this.u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
		if (!this.u_LightPosition) {
			console.log('Failed to get u_LightPosition variable');
			return;
		}

		// Get the storage location of u_AmbientLight
		this.u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
		if (!this.u_AmbientLight) {
			console.log('Failed to get u_AmbientLight variable');
			return;
		}

		// Get the storage location of u_colorAmbient
		this.u_colorAmbient = gl.getUniformLocation(gl.program, 'u_colorAmbient');
		if (!this.u_colorAmbient) {
			console.log('Failed to get u_colorAmbient variable');
			return;
		}

		// Get the storage location of u_colorSpec
		this.u_colorSpec = gl.getUniformLocation(gl.program, 'u_colorSpec');
		if (!this.u_colorSpec) {
			console.log('Failed to get u_colorSpec variable');
			return;
		}

		// Get the storage location of u_shininess
		this.u_shininess = gl.getUniformLocation(gl.program, 'u_shininess');
		if (!this.u_shininess) {
			console.log('Failed to get u_shininess variable');
			return;
		}

		this.u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
		if (!this.u_mvpMatrix) {
			console.log('Failed to get the storage location of u_mvpMatrix');
			return;
		}

		this.gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
		// Set the ambient light
		this.gl.uniform3f(this.u_AmbientLight, 0.2, 0.2, 0.2);
		// Set the material ambient color
		this.gl.uniform3f(this.u_colorSpec, 0.2313, 0.2313, 0.2313);
		// Set the material specular color
		this.gl.uniform3f(this.u_colorSpec, 0.7739, 0.7739, 0.7739);
		// Set the material shininess
		this.gl.uniform1f(this.u_shininess, 90);

		this.viewport = viewport;

		this.N_ctr = N_ctr;
		this.M_ctr = M_ctr;
		this.N = N;
		this.M = M;
		this.p = p;
		this.q = q;
		this.alpha = alpha;

		this.setDependentGeomParameters(Xmin, Xmax, Ymin, Ymax, Z);
	},
	setDependentGeomParameters: function (Xmin, Xmax, Ymin, Ymax, Z) {
		this.Xmid = Xmin + (Xmax - Xmin) / 2.0;
		this.Ymid = Ymin + (Ymax - Ymin) / 2.0;

		Camera.r_0 = Math.sqrt(Math.pow((Xmax - Xmin) / 2.0, 2) +
			Math.pow((Ymax - Ymin) / 2.0, 2) +
			Math.pow(Z, 2));

		this.resetCamera();
	},
	generateControlPoints: function (n, m, Xmin, Xmax, Ymin, Ymax, Z) {
		this.pointsCtr = new Array(n);
		for (let i = 0; i < n; i++)
			this.pointsCtr[i] = new Array(m);

		for (let i = 0; i < n; i++)
			for (let j = 0; j < m; j++) {
				const x = Xmin + i * (Xmax - Xmin) / (n - 1) - this.Xmid;
				const y = Ymin + j * (Ymax - Ymin) / (m - 1) - this.Ymid;
				const z = Z * Math.sin(x) * Math.sin(y);

				this.add_coords(i, j, x, y, z);
			}

		this.add_vertices(n, m);
		this.FSIZE = this.verticesCtr.BYTES_PER_ELEMENT;

		this.createIndicesCtr(n, m);
		this.ISIZE = this.indicesCtr.BYTES_PER_ELEMENT;

		if (this.drawLineSurfaceSplines)
			this.calculateLineSurfaceSpline();

		this.setVertexBuffersAndDraw();
	},
	resetCamera: function () {
		this.xRot = 0;
		this.yRot = 0;
		this.wheelDelta = 0.0;
	},
	setLeftButtonDown: function (value) {
		this.leftButtonDown = value;
	},
	add_coords: function (i, j, x, y, z) {
		const pt = new Point(x, y, z);
		this.pointsCtr[i][j] = pt;
	},
		setAxes: function () {
			this.verticesAxes.set(Camera.getAxesPoints());
	},
	create_coord_tip: function () {
		let r, phi, x, y, z;
		let i, j, k;

		let pt;

				const height = Camera.getAxesTipLength();
		const rTop = 0;
		const rBase = 0.25 * height;
		this.nLongitudes = 36;
		this.nLatitudes = 2;

		const count = this.nLatitudes * this.nLongitudes * 3; //x,y,z
		this.verticesAxesTip = new Float32Array(count);

		k = 0;
		for (i = 0; i < this.nLatitudes; i++)
			for (j = 0; j < this.nLongitudes; j++) {
				r = rBase + (rTop - rBase) / (this.nLatitudes - 1) * i;
				phi = 2 * Math.PI / this.nLongitudes * j;

				x = r * Math.cos(phi);
				y = r * Math.sin(phi);
				z = height / (this.nLatitudes - 1) * i - height;

				//console.log("p = ", p, "  q = ", q, "  i = ", i, "  j = ", j, "  x = ", x, "  y = ", y, "  z = ", z);

				this.verticesAxesTip[k++] = x;
				this.verticesAxesTip[k++] = y;
				this.verticesAxesTip[k++] = z;
			}
	},
	create_indexes_tip: function () {
		let i, j, k, p, q;
		let m_countTipIndices;
		let indicesVectorCtr;

		const countIndices = (this.nLatitudes - 1) * this.nLongitudes * 2 * 3;
		
		this.indicesAxesTip = new Uint16Array(countIndices);

		k = 0;

		for (i = 0; i < this.nLatitudes - 1; i++)
			for (j = 0; j < this.nLongitudes; j++) {
				if (j != this.nLongitudes - 1) {
					this.indicesAxesTip[k++] = this.nLongitudes * i + j;
					this.indicesAxesTip[k++] = this.nLongitudes * i + j + 1;
					this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j + 1;

					this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j + 1;
					this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j;
					this.indicesAxesTip[k++] = this.nLongitudes * i + j;
				}
				else {
					this.indicesAxesTip[k++] = this.nLongitudes * i + j;
					this.indicesAxesTip[k++] = this.nLongitudes * i;
					this.indicesAxesTip[k++] = this.nLongitudes * (i + 1);

					this.indicesAxesTip[k++] = this.nLongitudes * (i + 1);
					this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j;
					this.indicesAxesTip[k++] = this.nLongitudes * i + j;
				}
			}
	},
	createIndicesCtr: function (n, m) {
		let i, j, k = 0;
		this.indicesCtr = new Uint16Array(2 * n * m);

		for (i = 0; i < n; i++)
			for (j = 0; j < m; j++)
				this.indicesCtr[k++] = i * m + j;
		for (j = 0; j < m; j++)
			for (i = 0; i < n; i++)
				this.indicesCtr[k++] = i * m + j;
	},
	createIndicesSplineLines: function (n, m) {
		let i, j, k = 0;
		this.indicesSplineLines = new Uint16Array(2 * n * m);

		for (i = 0; i < n; i++) {
			for (j = 0; j < m; j++)
				this.indicesSplineLines[k++] = i * m + j;
		}
		for (j = 0; j < m; j++) {
			for (i = 0; i < n; i++)
				this.indicesSplineLines[k++] = i * m + j;
		}
	},
	createIndicesSplineSurface: function (n, m) {
		let k = 0;
		this.indicesSplineSurface = new Uint16Array(6 * (n - 1) * (m - 1));

		for (let i = 0; i < n - 1; i++)
			for (let j = 0; j < m - 1; j++) {
				this.indicesSplineSurface[k++] = i * m + j;
				this.indicesSplineSurface[k++] = (i + 1) * m + j;
				this.indicesSplineSurface[k++] = i * m + j + 1;
				this.indicesSplineSurface[k++] = i * m + j + 1;
				this.indicesSplineSurface[k++] = (i + 1) * m + j;
				this.indicesSplineSurface[k++] = (i + 1) * m + j + 1;
			}
	},
	setXRotation: function (angle) {
		const lAngle = Camera.normalizeAngle(angle);
		if (lAngle != this.xRot) {
			this.xRot = lAngle;
		}
	},
	setYRotation: function (angle) {
		const lAngle = Camera.normalizeAngle(angle);
		if (lAngle != this.yRot) {
			this.yRot = lAngle;
		}
	},
	mousemoveHandler: function (x, y) {
		if (this.leftButtonDown) {
			if (this.movePoint) {
				const offset = this.iMove * this.M_ctr.value + this.jMove;
				const winCoord = vec4.create();

				winCoord[0] = x;
				winCoord[1] = y;
				winCoord[2] = this.pointsCtr[this.iMove][this.jMove].winz;
				winCoord[3] = 1.0;

				const mvMatr = mat4.mul(mat4.create(), this.cam, this.world);

				const worldCoord = unproject(winCoord, mvMatr, this.proj, this.viewport);

				this.pointsCtr[this.iMove][this.jMove].x = worldCoord[0];
				this.pointsCtr[this.iMove][this.jMove].y = worldCoord[1];
				this.pointsCtr[this.iMove][this.jMove].z = worldCoord[2];

				this.verticesCtr[offset * this.countAttribData] = this.pointsCtr[this.iMove][this.jMove].x;
				this.verticesCtr[offset * this.countAttribData + 1] = this.pointsCtr[this.iMove][this.jMove].y;
				this.verticesCtr[offset * this.countAttribData + 2] = this.pointsCtr[this.iMove][this.jMove].z;

				if (this.drawLineSurfaceSplines)
					this.calculateLineSurfaceSpline();
			}
			else {
				const dx = x - this.lastPosX;
				const dy = y - this.lastPosY;

				this.setXRotation(this.xRot - 8 * dy);
				this.setYRotation(this.yRot + 8 * dx);

				this.lastPosX = x;
				this.lastPosY = y;
			}
			this.setVertexBuffersAndDraw();
		}
		else
			for (let i = 0; i < this.N_ctr.value; i++)
				for (let j = 0; j < this.M_ctr.value; j++) {
					this.pointsCtr[i][j].select = false;

					if (this.pointsCtr[i][j].ptInRect(x, y))
						this.pointsCtr[i][j].select = true;

					this.verticesCtr[(i * this.M_ctr.value + j) * this.countAttribData + 3] = this.pointsCtr[i][j].select;

					this.setVertexBuffersAndDraw();
				}
	},
	mousedownHandler: function (button, x, y) {
		switch (button) {
			case 0: //left button
				this.movePoint = false;

				for (let i = 0; i < this.N_ctr.value; i++)
					for (let j = 0; j < this.M_ctr.value; j++) {
						if (this.pointsCtr[i][j].select == true) {
							this.movePoint = true;
							this.iMove = i;
							this.jMove = j;
						}
					}

				if (!this.movePoint) {
					this.lastPosX = x;
					this.lastPosY = y;
				}

				this.setLeftButtonDown(true);
				break;
			case 2: //right button
				this.resetCamera();
				this.setVertexBuffersAndDraw();
				break;
		}
	},
	mouseupHandler: function (button, x, y) {
		if (button == 0) //left button
			this.setLeftButtonDown(false);
	},
	mousewheel: function (delta) {
		const d = Camera.r_0 * (-1.) * delta / 1000.0;
		if ((this.wheelDelta + d >= -Camera.r_0) && (this.wheelDelta + d <= Camera.r_0 * 3.0))
			this.wheelDelta += d;

		this.setVertexBuffersAndDraw();
	},
	add_vertices: function (n, m) {
		this.verticesCtr = new Float32Array(n * m * this.countAttribData);
		for (let i = 0; i < n; i++)
			for (let j = 0; j < m; j++) {
				const offset = i * m + j;
				this.verticesCtr[offset * this.countAttribData] = this.pointsCtr[i][j].x;
				this.verticesCtr[offset * this.countAttribData + 1] = this.pointsCtr[i][j].y;
				this.verticesCtr[offset * this.countAttribData + 2] = this.pointsCtr[i][j].z;
				this.verticesCtr[offset * this.countAttribData + 3] = this.pointsCtr[i][j].select;
			}
	},
	setVertexBuffersAndDraw: function () {
		let i, j;
		let q, rotateMatrix, translateMatrix, transformMatrix, axesTransformMatrix;
		
		this.cam = Camera.getLookAt(this.wheelDelta, this.xRot, this.yRot);
		this.proj = Camera.getProjMatrix();

		this.gl.uniform4f(this.u_LightPosition, Camera.x0, Camera.y0, Camera.z0, 1.0);

		this.gl.uniform1f(this.u_drawPolygon, false);

		// Clear <canvas>
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		this.setAxes();
		this.create_coord_tip();
		this.create_indexes_tip();
		
		// Bind the buffer object to target
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferAxes);
		// Write date into the buffer object
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesAxes, this.gl.DYNAMIC_DRAW);
		// Assign the buffer object to a_Position variable
		this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
		// Enable the assignment to a_Position variable
		this.gl.enableVertexAttribArray(this.a_Position);
		// Disable the assignment to a_select variable
		this.gl.disableVertexAttribArray(this.a_select);
		// Disable the assignment to a_normal variable
		this.gl.disableVertexAttribArray(this.a_normal);
		
		const axes_scale = 0.1;
		const half_axes_scale_length = 1.5 * (this.verticesAxes[17] - this.verticesAxes[14]) * axes_scale / 2;
		const scaleMatrix = mat4.fromScaling(mat4.create(), [axes_scale, axes_scale, axes_scale]);
		translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[3] - half_axes_scale_length, //x_max - half_axes_scale_length
																																					-this.verticesAxes[10] + half_axes_scale_length, //-y_max + half_axes_scale_length 
																																					this.verticesAxes[17] - half_axes_scale_length)); //z_max - half_axes_scale_length 
			transformMatrix = mat4.mul(mat4.create(), scaleMatrix, this.world);
			transformMatrix = mat4.mul(mat4.create(), this.cam, transformMatrix);
			transformMatrix = mat4.mul(mat4.create(), translateMatrix, transformMatrix);
			transformMatrix = mat4.mul(mat4.create(), this.proj, transformMatrix);
			this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, transformMatrix);
		
		// Draw
		this.gl.uniform4f(this.u_color, 1.0, 0.0, 0.0, 1.0);
		this.gl.drawArrays(this.gl.LINES, 0, 2);
		this.gl.uniform4f(this.u_color, 0.0, 1.0, 0.0, 1.0);
		this.gl.drawArrays(this.gl.LINES, 2, 2);
		this.gl.uniform4f(this.u_color, 0.0, 0.0, 1.0, 1.0);
		this.gl.drawArrays(this.gl.LINES, 4, 2);
		
		const countTipIndices = (this.nLatitudes - 1) * this.nLongitudes * 2 * 3;
		// Bind the buffer object to target
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferAxesTip);
		// Write date into the buffer object
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesAxesTip, this.gl.DYNAMIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferAxesTip);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesAxesTip, this.gl.DYNAMIC_DRAW);
		// Assign the buffer object to a_Position variable
		this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
		// Enable the assignment to a_Position variable
		this.gl.enableVertexAttribArray(this.a_Position);
		// Disable the assignment to a_select variable
		this.gl.disableVertexAttribArray(this.a_select);
		// Disable the assignment to a_normal variable
		this.gl.disableVertexAttribArray(this.a_normal);
		this.gl.uniform4f(this.u_color, 0.0, 0.0, 0.0, 1.0);

				for (i=0; i<3; i++) {
						switch (i) {
						case 0:
						q = quat.rotationTo(quat.create(), [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]);
						translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[3], this.verticesAxes[4], this.verticesAxes[5])); //x_max
								break;
						case 1:
						q = quat.rotationTo(quat.create(), [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]);
						translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[9], this.verticesAxes[10], this.verticesAxes[11])); //y_max
								break;
						case 2:
						q = quat.rotationTo(quat.create(), [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]);
						translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[15], this.verticesAxes[16], this.verticesAxes[17])); //z_max
								break;
						}
				rotateMatrix = mat4.fromQuat(mat4.create(), q);
				axesTransformMatrix = mat4.mul(mat4.create(), translateMatrix, rotateMatrix);
				axesTransformMatrix = mat4.mul(mat4.create(), transformMatrix, axesTransformMatrix);
				this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, axesTransformMatrix);
				this.gl.drawElements(this.gl.TRIANGLES, countTipIndices, this.gl.UNSIGNED_SHORT, 0);
			
		}
		
		const mvMatr = mat4.mul(mat4.create(), this.cam, this.world);
		const mvpMatr = mat4.mul(mat4.create(), this.proj, mvMatr);
		
		this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, mvpMatr);
		
		// Bind the buffer object to target
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCtr);
		// Write date into the buffer object
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesCtr, this.gl.DYNAMIC_DRAW);
		// Assign the buffer object to a_Position variable
		this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE * 4, 0);
		// Enable the assignment to a_Position variable
		this.gl.enableVertexAttribArray(this.a_Position);
		// Assign the buffer object to a_select variable
		this.gl.vertexAttribPointer(this.a_select, 1, this.gl.FLOAT, false, this.FSIZE * 4, this.FSIZE * 3);
		// Enable the assignment to a_select variable
		this.gl.enableVertexAttribArray(this.a_select);
		// Disable the assignment to a_normal variable
		this.gl.disableVertexAttribArray(this.a_normal);

		this.gl.uniform4f(this.u_color, 0.0, 0.0, 0.0, 1.0);
		this.gl.uniform4f(this.u_colorSelect, 0.5, 0.5, 0.0, 1.0);
		this.gl.uniform1f(this.u_pointSize, 3.0);
		this.gl.uniform1f(this.u_pointSizeSelect, 7.0);

		for (i = 0; i < this.N_ctr.value; i++)
			for (j = 0; j < this.M_ctr.value; j++)
				this.pointsCtr[i][j].calculateWindowCoordinates(mvpMatr, this.viewport);

		// Draw
		if (this.showControlPoints)
				this.gl.drawArrays(this.gl.POINTS, 0, this.N_ctr.value * this.M_ctr.value);
		if (this.drawControlPolygon) {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferCtr);
			this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesCtr, this.gl.DYNAMIC_DRAW);

			this.gl.uniform4f(this.u_color, 0.0, 1.0, 0.0, 1.0);
			this.gl.uniform4f(this.u_colorSelect, 0.0, 1.0, 0.0, 1.0);

			for (i = 0; i < this.N_ctr.value; i++)
				this.gl.drawElements(this.gl.LINE_STRIP, this.M_ctr.value, this.gl.UNSIGNED_SHORT, ((i * this.M_ctr.value) * this.ISIZE));

			this.gl.uniform4f(this.u_color, 0.0, 0.0, 1.0, 1.0);
			this.gl.uniform4f(this.u_colorSelect, 0.0, 0.0, 1.0, 1.0);

			for (j = 0; j < this.M_ctr.value; j++)
				this.gl.drawElements(this.gl.LINE_STRIP, this.N_ctr.value, this.gl.UNSIGNED_SHORT, ((this.N_ctr.value * this.M_ctr.value + j * this.N_ctr.value) * this.ISIZE));
		}
		if (this.drawLineSurfaceSplines) {
			// Bind the buffer object to target
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferSpline);
			// Write date into the buffer object
			this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesSpline, this.gl.DYNAMIC_DRAW);
			//var FSIZE = this.verticesSpline.BYTES_PER_ELEMENT;
			// Assign the buffer object to a_Position variable
			this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE * 6, 0);
			// Assign the buffer object to a_normal variable
			this.gl.vertexAttribPointer(this.a_normal, 3, this.gl.FLOAT, false, this.FSIZE * 6, this.FSIZE * 3);
			// Enable the assignment to a_Position variable
			this.gl.enableVertexAttribArray(this.a_Position);
			// Disable the assignment to a_select variable
			this.gl.disableVertexAttribArray(this.a_select);
			// Enable the assignment to a_normal variable
			this.gl.enableVertexAttribArray(this.a_normal);

			this.gl.uniform4f(this.u_color, 1.0, 0.0, 0.0, 1.0);
			this.gl.uniform1f(this.u_pointSize, 5.0);
			//points
			if (this.visualizeSplineWithPoints)
				this.gl.drawArrays(this.gl.POINTS, 0, this.N.value * this.M.value);
			//lines
			if (this.visualizeSplineWithLines) {
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineLines);
				this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineLines, this.gl.DYNAMIC_DRAW);

				this.gl.uniform4f(this.u_color, 0.0, 1.0, 1.0, 1.0);

				for (i = 0; i < this.N.value; i++)
					this.gl.drawElements(this.gl.LINE_STRIP, this.M.value, this.gl.UNSIGNED_SHORT, ((i * this.M.value) * this.ISIZE));

				this.gl.uniform4f(this.u_color, 1.0, 0.0, 1.0, 1.0);

				for (j = 0; j < this.M.value; j++)
					this.gl.drawElements(this.gl.LINE_STRIP, this.N.value, this.gl.UNSIGNED_SHORT, ((this.N.value * this.M.value + j * this.N.value) * this.ISIZE));
			}
			//surface
			if (this.visualizeSplineWithSurface) {
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineSurface);
				this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineSurface, this.gl.DYNAMIC_DRAW);

				this.gl.uniform1f(this.u_drawPolygon, true);
				this.gl.depthMask(false);
				this.gl.enable(this.gl.BLEND);
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
				this.gl.uniform4f(this.u_color, 0.2775, 0.2775, 0.2775, this.alpha.value);
				this.gl.drawElements(this.gl.TRIANGLES, 6 * (this.N.value - 1) * (this.M.value - 1), this.gl.UNSIGNED_SHORT, 0);
				this.gl.disable(this.gl.BLEND);
				this.gl.depthMask(true);
			}
		}
	},
	plotMode: function (selOption) {
		switch (selOption) {
			case 1:
				this.drawLineSurfaceSplines = !this.drawLineSurfaceSplines;
				if (this.drawLineSurfaceSplines)
					this.calculateLineSurfaceSpline();
				break;
			case 2:
				if (this.drawLineSurfaceSplines)
					this.calculateLineSurfaceSpline();
				break;
			case 3:
				this.drawControlPolygon = !this.drawControlPolygon;
				break;
			case 4:
				this.visualizeSplineWithPoints = !this.visualizeSplineWithPoints;
				break;
			case 5:
				this.visualizeSplineWithLines = !this.visualizeSplineWithLines;
				break;
			case 6:
				this.visualizeSplineWithSurface = !this.visualizeSplineWithSurface;
				break;
			case 7:
				this.showControlPoints = !this.showControlPoints;
				break;
		}
		this.setVertexBuffersAndDraw();
	},
	calculateLineSurfaceSpline: function () {

		let i,	j;
		let u,	v;
		let du,	dv;

		const N_ctr	= Number(this.N_ctr.value);
		const M_ctr	= Number(this.M_ctr.value);
		const N		= Number(this.N.value);
		const M		= Number(this.M.value);
		const p		= Number(this.p.value);
		const q		= Number(this.q.value);

		this.pointsSpline	= new Array(N);
		this.normalsSpline	= new Array(N);
		for (i = 0; i < N; i++)
		{
			this.pointsSpline[i] = new Array(M);
			this.normalsSpline[i] = new Array(M);
			for (j = 0; j < M; j++)
				this.normalsSpline[i][j] = new Array(3);
		}

		// calculating the knot vector (U)
		let U = new Array(N_ctr + p + 1);
		for (i = 0; i <= p; ++i)
			U[i] = 0;
		for (i = p + 1; i <= N_ctr - 1; ++i)
			U[i] = i - p;
		for (i = N_ctr; i <= N_ctr + p; ++i)
			U[i] = N_ctr - p;

		// calculating the knot vector (V)
		let V = new Array(M_ctr + q + 1);
		for (i = 0; i <= q; ++i)
			V[i] = 0;
		for (i = q + 1; i <= M_ctr - 1; ++i)
			V[i] = i - q;
		for (i = M_ctr; i <= M_ctr + q; ++i)
			V[i] = M_ctr - q;

		du = (U[U.length - 1] - U[0]) / (N - 1);
		dv = (V[V.length - 1] - V[0]) / (M - 1);
		u = U[0];
		for (i = 0; i < N; i++)
		{
			v = V[0];
			for (j = 0; j < M; j++)
			{	
				this.pointsSpline[i][j] = surfacePoint(N_ctr - 1, p, U, M_ctr - 1, q, V, this.pointsCtr, u, v);
				let deriv = surfaceDerivs(N_ctr - 1, p, U, M_ctr - 1, q, V, this.pointsCtr, u, v, 2);

				const pt_u = vec3.fromValues(deriv[0].x, deriv[0].y, deriv[0].z);
				const pt_v = vec3.fromValues(deriv[1].x, deriv[1].y, deriv[1].z);

				//CALCULATE NORMAL VECTOR
				let normal = vec3.create();
				normal = vec3.cross(normal, pt_u, pt_v);

				this.normalsSpline[i][j][0] = normal[0];
				this.normalsSpline[i][j][1] = normal[1];
				this.normalsSpline[i][j][2] = normal[2];

				v += dv;
			}
			u += du;
		}

		this.verticesSpline = new Float32Array(N * M * 6);
		for (i = 0; i < N; i++)
			for (j = 0; j < M; j++) {
				const offset = i * M + j;
				this.verticesSpline[offset * 6] = this.pointsSpline[i][j].x;
				this.verticesSpline[offset * 6 + 1] = this.pointsSpline[i][j].y;
				this.verticesSpline[offset * 6 + 2] = this.pointsSpline[i][j].z;
				this.verticesSpline[offset * 6 + 3] = this.normalsSpline[i][j][0];
				this.verticesSpline[offset * 6 + 4] = this.normalsSpline[i][j][1];
				this.verticesSpline[offset * 6 + 5] = this.normalsSpline[i][j][2];
			}

		this.createIndicesSplineLines(N, M);
		this.createIndicesSplineSurface(N, M);
	}
}

function mousedown(ev, canvas) {
	event = EventUtil.getEvent(event);

	const x = ev.clientX; // x coordinate of a mouse pointer
	const y = ev.clientY; // y coordinate of a mouse pointer
	const rect = ev.target.getBoundingClientRect();

	Data.mousedownHandler(EventUtil.getButton(ev), x - rect.left, canvas.height - (y - rect.top));
}

function mouseup(ev, canvas) {
	event = EventUtil.getEvent(event);

	const x = ev.clientX; // x coordinate of a mouse pointer
	const y = ev.clientY; // y coordinate of a mouse pointer
	const rect = ev.target.getBoundingClientRect();

	Data.mouseupHandler(EventUtil.getButton(ev), x - rect.left, canvas.height - (y - rect.top));
}

function mousemove(ev, canvas) {
	const x = ev.clientX; // x coordinate of a mouse pointer
	const y = ev.clientY; // y coordinate of a mouse pointer
	const rect = ev.target.getBoundingClientRect();

	Data.mousemoveHandler(x - rect.left, canvas.height - (y - rect.top));
}
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
        this.pointsCtr[i][j] = new Point(x, y, z);
    },
    setAxes: function () {
        this.verticesAxes.set(Camera.getAxesPoints());
    },
    create_coord_tip: function () {
        let r, phi, x, y, z;
        let i, j, k;

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
        let i, j, k;

        const countIndices = (this.nLatitudes - 1) * this.nLongitudes * 2 * 3;

        this.indicesAxesTip = new Uint16Array(countIndices);

        k = 0;

        for (i = 0; i < this.nLatitudes - 1; i++)
            for (j = 0; j < this.nLongitudes; j++) {
                if (j !== this.nLongitudes - 1) {
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
        if (lAngle !== this.xRot) {
            this.xRot = lAngle;
        }
    },
    setYRotation: function (angle) {
        const lAngle = Camera.normalizeAngle(angle);
        if (lAngle !== this.yRot) {
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
                        if (this.pointsCtr[i][j].select === true) {
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
    mouseupHandler: function (button) {
        if (button === 0) //left button
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

        if (p >= N_ctr || q >= M_ctr)
            return ;

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
        let SKL = new Array(2);
        for (let k = 0; k < 2; ++k)
            SKL[k] = new Array(2);
        for (i = 0; i < N; i++)
        {
            v = V[0];
            for (j = 0; j < M; j++)
            {
                surfaceDerivs(N_ctr - 1, p, U, M_ctr - 1, q, V, this.pointsCtr, u, v, 1, SKL);
                this.pointsSpline[i][j] = SKL[0][0];

                const pt_u = vec3.fromValues(SKL[1][0].x, SKL[1][0].y, SKL[1][0].z);
                const pt_v = vec3.fromValues(SKL[0][1].x, SKL[0][1].y, SKL[0][1].z);

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
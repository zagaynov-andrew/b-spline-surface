
function findSpan(n, k, t, knot_vector)
{
    if (Math.round(t * 1000000) === Math.round(knot_vector[n + 1] * 1000000))
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

function surfaceDerivs(n, p, U, m, q, V, pointsCtr, u, v, d, SKL)
{
    let du = Math.min(d, p);
    for (let k = p + 1; k <= d; k++)
        for (let l = 0; l <= d - k; l++)
            SKL[k][l] = 0.0;
    let dv = Math.min(d, q);
    for (let l = q + 1; l <= d; l++)
        for (let k = 0; k <= d - l; k++)
            SKL[k][l] = 0.0;
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
    let temp = new Array(q + 1);
    for (let i = 0; i < q + 1; ++i)
        temp[i] = new Point;
    for (let i = 0; i <= d; ++i)
        for (let j = 0; j <= d; ++j)
            SKL[i][j] = 0.0;
    for (let k = 0; k <= du; k++)
    {
        for (let s = 0; s <= q; s++)
        {
            temp[s].x = 0.;
            temp[s].y = 0.;
            temp[s].z = 0.;
            for (let r = 0; r <= p; r++)
            {
                temp[s].x += N_u[k][r] * pointsCtr[u_span - p + r][v_span - q + s].x;
                temp[s].y += N_u[k][r] * pointsCtr[u_span - p + r][v_span - q + s].y;
                temp[s].z += N_u[k][r] * pointsCtr[u_span - p + r][v_span - q + s].z;
            }
        }
        let dd = Math.min(d - k, dv);
        for (let l = 0; l <= dd; l++)
        {
            SKL[k][l] = new Point(0, 0, 0);
            for (let s = 0; s <= q; s++)
            {
                SKL[k][l].x += N_v[l][s] * temp[s].x;
                SKL[k][l].y += N_v[l][s] * temp[s].y;
                SKL[k][l].z += N_v[l][s] * temp[s].z;
            }
        }
    }
}

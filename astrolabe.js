//Physical constants
var pi2      = Math.PI / 2.0;
var pi4      = Math.PI / 4.0;
var twopi    = 2 * Math.PI;
var threepi2 = 3 * Math.PI / 2.0;
var e        = 23.438446 * (Math.PI / 180);        //obliquity of the ecliptic (Year 2006)
var latitude = 34* (Math.PI / 180);
//Graphics constants
var size = 800;
var hsize = size / 2;
var capricorn_ratio  = 0.90;

//Derived constants
var capricorn_size   = size * capricorn_ratio;
var capricorn_border = (size - capricorn_size) /2;


var r_capricorn = capricorn_size / 2;
var r_equator   = r_capricorn * Math.tan((pi2 - e) / 2);
var r_cancer    = r_equator   * Math.tan((pi2 - e) / 2);

//Conversion functions
function CartesianToScreenX(x)
{
        // if x = 0,           return size / 2
        // if x = r_capricorn, return size / 2 + r_capricorn

        return (size /2) + (x / r_capricorn) * (r_capricorn);
}
function CartesianToScreenY(x)
{
        // if x = 0,           return size / 2
        // if x = r_capricorn, return capricorn_border

        return (size /2) - (x / r_capricorn) * (r_capricorn);
}


function PolarArctan( num, den)
{
        ang = Math.atan2(num, den);
        return (ang >= 0.0) ? ang : ang + twopi;
}

function IntersectCircles(xa, ya, r1, xb, yb, r2)
{
        var ret = {x1 : 0, x2 : 0, y1: 0, y2:0, intersects: false};
        var dy0 = false;

        //Check for vertical intersection line (ya=yb) to avoid a divide by zero)
        if ( ya == yb)
        {
                dy0 = true;
                //Rotate base circle vertically
                ya = yb + (xb - xa);
                xa = xb;
        }

        //Set origin to base circle. x0,y0 is centet of intersecting circle relative to base
        x0 = xa - xb;
        y0 = ya - yb;

        //Calculate intersection line
        m  = -1 * x0 / y0;
        b = -1*( (r2 * r2) - (r1 * r1) - (y0 * y0) - (x0 * x0)) / (2.0 *y0);

        ac = 4.0 * ( 1.0 + m * m) * (b * b - r1 * r1); //4ac part of discriminant
        b2 = 4.0 * m*m * b*b;                          //B^2 part of discriminant

        if (ac > b2) return ret; //No solutions, no intersection.
        ret.intersects = true;

        if ( m == 0)
        {
                //Symmetrical roots
                ret.x2 = Math.sqrt(r1*r1 - b*b);
                ret.x1 = -1 * ret.x2;
        }else
        {
                //Temp factors
                f1 = -2 * m * b;
                f2 = Math.sqrt(b2 - ac);
                f3 = 2 * (1 + m*m);
                //Roots are intersection coordinates
                ret.x1 = (f1 + f2) / f3;
                ret.x2 = (f1 - f2) / f3;
        }

        //Calculate Y coordinates where intercept line meets X
        ret.y1 = m * ret.x1 + b;
        ret.y2 = m * ret.x2 + b;

        //Now readjust solution so it is not relative to 0,0 but xa,ya
        ret.x1 = ret.x1 - x0; ret.x2 = ret.x2 - x0;
        //ret.y1 = ret.y1 - y0; ret.y2 = ret.y2 - y0; //The book says this, but doesn't work
        ret.y1 = y0 - ret.y1; ret.y2 = y0 - ret.y2;

        //Calculate intersection angles
        ret.a1 = (ret.x1 != 0.0) ? PolarArctan( ret.y1, ret.x1) : (( ret.y1 > 0.0) ?  pi2 : threepi2);
        ret.a2 = (ret.x2 != 0.0) ? PolarArctan( ret.y2, ret.x2) : (( ret.y2 > 0.0) ?  pi2 : threepi2);

        //Vertical intersection case : rotate angles and calculate x,y for base
        if (dy0)
        {
                A = [ret.a1,ret.a2]
                //Swap ret.a1,ret.a2
                ret.a1 = A[1]; ret.a2 = A[0];

                //Normalize intersection angles
                ret.a1 += pi2;
                if (ret.a1 > twopi) ret.a1 -= twopi;
                while(ret.a1 < 0) ret.a1 += twopi;

                ret.a2 += pi2;
                if (ret.a2 > twopi) ret.a2 -= twopi;
                while(ret.a2<0) ret.a2 += twopi;

                //Intersection coordinates for relative to center of base circle
                ret.x1 = r2 * Math.cos(ret.a1); ret.x2 = ret.x1;
                ret.y1 = r2 * Math.sin(ret.a1); ret.y2 = -ret.y1;
        }

        //Sort returned values
        if(ret.a1 > ret.a2)
        {
                A = [ret.a1,ret.a2]; ret.a1=A[1]; ret.a2=A[0];
                X = [ret.x1,ret.x2]; ret.x1=X[1]; ret.x2=X[0];
                Y = [ret.y1,ret.y2]; ret.y1=Y[1]; ret.y2=Y[0];
        }

        return ret;
}

//Make a svg path string suitable for drawing an arc between x1,y1 and x2,y2 with radius r
//Must pass screen coordinates
function ArcPath(x1,y1, x2,y2, r, large_arc, sweep )
{
        //See http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
        return  "M"+ x1 + "," + y1 + " " //Start here
              + " A"+ r + " " + r  // rx , ry
              + " 0 " //x-axis rotation
              + large_arc + " " //large-arc-flag
              + sweep     + " " //sweep flag
              + x2 + "," + y2;
}

//Draw circle x,y,r clipped by xc,yc,rc
//Coordinates must be cartesian
function ClippedCircle(svg,x,y,r,xc,yc,rc)
{
        i = IntersectCircles(x, y, r, xc, yc, rc);
        if(i.intersects)
        {
                //Draw clipped circle
                path = ArcPath(CartesianToScreenX(i.x1) ,
                               CartesianToScreenY(i.y1) ,
                               CartesianToScreenX(i.x2) ,
                               CartesianToScreenY(i.y2) ,
                               r,
                               (i.a1 > pi4) ? 1 : 0 , //Large-arc
                               1);
                svg.path(path);
        }else{
                //Draw full circle
                svg.circle(CartesianToScreenX(x), CartesianToScreenY(y), r)
        }
}

function ClippedToCapricorn(svg,x,y,r)
{
        ClippedCircle(svg,x,y,r,0,0,r_capricorn);
}

function Draw()
{
    var svg = Raphael(10,50,size,size);

    svg.circle(size / 2 , size / 2, r_capricorn);
    svg.circle(size / 2 , size / 2, r_equator);
    svg.circle(size / 2 , size / 2, r_cancer);

    //Draw "crosshair"
    svg.path("M"+ capricorn_border + " " + (size /2)        + " h " + capricorn_size);
    svg.path("M"+ (size / 2)       + " " + capricorn_border + " v " + capricorn_size);


    //Draw horizon
    var yc = r_equator / Math.tan(latitude);
    var rh = r_equator / Math.sin(latitude);
    //svg.circle( size / 2, CartesianToScreenY(yc), rh); //This would draw the whole horizon
    var h = Math.asin(Math.tan(latitude) * Math.tan(e)); //Angle horizon makes to E-W line //TODO: breaks at high lat
    var yh = Math.sin(h) * r_capricorn;
    var xh = Math.cos(h) * r_capricorn;
    ClippedToCapricorn(svg,0, yc, rh);

    //Draw Zenith as small circle
    var yz = r_equator * Math.tan((pi2 - latitude) / 2)
    svg.circle(size / 2 , CartesianToScreenY(yz), 5);


    function Almucantar(a)
    {
	    a_rad = a * (Math.PI / 180)
	    tmp = r_equator / (Math.sin(latitude) + Math.sin(a_rad));
	    ra = Math.cos(a_rad)     * tmp;
	    ya = Math.cos(latitude)  * tmp;
	    // svg.circle( size / 2 , CartesianToScreenY(ya), ra);
	    ClippedToCapricorn(svg,0, ya, ra);
    }

    //Doesn't work, why?
    // for(ac = 10 ; ac <= 90 ; ac += 10)
    // {
    //         Almucantar(ac);
    // }

    Almucantar(10);
    Almucantar(20);
    Almucantar(30);
    Almucantar(40);
    Almucantar(50);
    Almucantar(60);
    Almucantar(70);
    Almucantar(80);
    Almucantar(90);
}

function circle(elem, cx, cy, r, class_name)
{
    return elem.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("class", class_name)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
}
var svg = d3.select("body")
   .append("svg:svg")
    .attr("class", "vis")
    .attr("width", 900)
    .attr("height", 900)
   //Use cartesian coordinates
   .append("g").attr("transform", "translate (" + hsize + "," + hsize + ") scale(1,-1)" )

//    .attr("width", r_capricorn * 1.2)
//    .attr("height", r_capricorn * 1.2);

circle(svg, 0, 0, r_capricorn, "tropic").attr("id","capricorn")
circle(svg, 0, 0, r_equator, "tropic")
circle(svg, 0, 0, r_cancer, "tropic")


// var h = Math.asin(Math.tan(latitude) * Math.tan(e)); //Angle horizon makes to E-W line //TODO: breaks at high lat
// var yh = Math.sin(h) * r_capricorn;
// var xh = Math.cos(h) * r_capricorn;
// circle(svg, 0, yc, rh, "horizon");


circle(svg.append("clipPath").attr("id", "clip_capricorn"), 0, 0, r_capricorn, "tropic")

g= svg.append("g").attr("clip-path", "url(#clip_capricorn)")
//Draw horizon
var yc = r_equator / Math.tan(latitude);
var rh = r_equator / Math.sin(latitude);
//circle(g, 0, yc, rh, "horizon"); //This would draw the whole horizon

function Almucantar(a)
{
    a_rad = a * (Math.PI / 180)
    tmp = r_equator / (Math.sin(latitude) + Math.sin(a_rad));
    ra = Math.cos(a_rad)     * tmp;
    ya = Math.cos(latitude)  * tmp;
    // svg.circle( size / 2 , CartesianToScreenY(ya), ra);
    circle(g, 0, ya, ra, "almucantar");
}

Almucantar(0); //Horizon
Almucantar(10);
Almucantar(20);
Almucantar(30);
Almucantar(40);
Almucantar(50);
Almucantar(60);
Almucantar(70);
Almucantar(80);
Almucantar(90);

//Draw Zenith as small circle
var yz = r_equator * Math.tan((pi2 - latitude) / 2)
circle(svg, 0, yz, 5, "zenith");

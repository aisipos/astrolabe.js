//Physical constants
var pi2      = Math.PI / 2.0; // 90 degrees
var pi4      = Math.PI / 4.0; // 45 degrees
var twopi    = 2 * Math.PI;
var threepi2 = 3 * Math.PI / 2.0;
var e        = 23.438446 * (Math.PI / 180);        //obliquity of the ecliptic (Year 2006)
var latitude = 34 * (Math.PI / 180);
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

function deg_to_rad(deg)
{
    return deg * (Math.PI / 180)
}

//
function circle(x,y,r)
{
    this.x = x;
    this.y = y;
    this.r = r;
}

circle.prototype.draw = function(elem, class_name)
{
    return elem.append("circle")
        .attr("cx", this.x)
        .attr("cy", this.y)
        .attr("r",  this.r)
        .attr("class", class_name)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
}

function draw_circle(elem, x, y, r, class_name)
{
    return (new circle(x,y,r)).draw(elem, class_name)
}

//Calculate almucantars
function Almucantar(a)
{
    a_rad = deg_to_rad(a)
    tmp = r_equator / (Math.sin(latitude) + Math.sin(a_rad));
    ra = Math.cos(a_rad)     * tmp;
    ya = Math.cos(latitude)  * tmp;
    return new circle(0, ya, ra);
}

//Draw azimuthal arc given degrees
function azimuthal_arc(a, elem)
{
    a = deg_to_rad(a)
    yz =  r_equator * Math.tan((pi2 - latitude)/2)
    yn = -r_equator * Math.tan((pi2 + latitude)/2)
    yc = (yz + yn) / 2
    yaz = yz - yc
    xa = yaz * Math.tan(a)
    ra = yaz / Math.cos(a)
    return new circle(xa, yc, ra)
}

//Draw whole astrolabe
function astrolabe()
{
    var svg = d3.select("body")
       .append("svg:svg")
        .attr("class", "vis")
        .attr("width", size)
        .attr("height", size)
       //Use cartesian coordinates
       //(0,0) represents the north celestial pole.
       .append("g").attr("transform", "translate (" + hsize + "," + hsize + ") scale(1,-1)" )


    //Draw Equators and tropics
    capricorn = new circle(0, 0, r_capricorn)
    capricorn.draw(svg, "tropic").attr("id", "capricorn");
    draw_circle(svg, 0, 0, r_equator, "tropic").attr("id","equator")
    draw_circle(svg, 0, 0, r_cancer, "tropic").attr("id","cancer")

    //Draw Zenith as small circle
    var yz = r_equator * Math.tan((pi2 - latitude) / 2)
    zenith = new circle(0, yz, 5)
    zenith.draw(svg, "zenith")

    horizon = Almucantar(0)

    //Clip most elements to tropic of capricorn, horizon, and zenith
    capricorn_clip_path = svg.append("clipPath").attr("id", "clip_capricorn")
    capricorn.draw(capricorn_clip_path, "tropic")

    horizon_clip_path = svg.append("clipPath").attr("id", "clip_horizon")
    horizon.draw(horizon_clip_path, "horizon")
    //sky = svg.append("g").attr("clip-path", "url(#clipsky)")
    capricorn_clipped = svg.append("g").attr("style", "clip-path: url(#clip_capricorn);")
    sky_clipped = capricorn_clipped.append("g").attr("style", "clip-path: url(#clip_horizon);")

    //Draw horizon
    horizon.draw(sky_clipped, "horizon")

    for (var angle = 5; angle <= 90; angle += 5){
        Almucantar(angle).draw(sky_clipped, "almucantar");
    }

    for (var angle = 0; angle <= 90; angle += 5){
        c=azimuthal_arc(angle);
        c.draw(sky_clipped, "azimuth");
        c.x = -c.x;
        c.draw(sky_clipped, "azimuth");
    }


    return svg;
}

svg = astrolabe()

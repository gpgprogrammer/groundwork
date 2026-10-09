import { hsPair } from "./outline";

/**
 * Geometry and Honors Geometry, following the Common Core Geometry standards in the usual
 * textbook order: foundations and proof, transformations and congruence, similarity and right
 * triangle trigonometry, circles, area and volume, then probability.
 */
export const [geometry, honorsGeometry] = hsPair(
  {
    slug: "geometry",
    title: "Geometry",
    shortTitle: "Geometry",
    category: "Math & Computer Science",
    hue: 160,
    grades: "Grade 9 or 10",
    description: "Proof, transformations, congruence and similarity, right triangle trigonometry, circles, and area and volume.",
    keywords: ["geometry", "geo"],
  },
  {
    slug: "honors-geometry",
    title: "Honors Geometry",
    shortTitle: "Hon. Geometry",
    hue: 168,
    grades: "Grade 9 or 10",
    description: "Everything in Geometry with more proof, plus the Laws of Sines and Cosines, vectors, and conic sections.",
    keywords: ["honors geometry", "geometry honors", "hon geometry"],
  },
  `
# Tools of Geometry | Points, lines, planes, and measuring segments and angles.
- Points, Lines, and Planes | The undefined terms of geometry and how they intersect. | Naming points, lines, and planes; Collinear and coplanar; Intersections | points lines and planes
- Measuring Segments | The Segment Addition Postulate and congruent segments. | Segment addition; Congruent segments; Midpoints | segment addition postulate
- The Midpoint and Distance Formulas | Coordinates give a segment's midpoint and length. | Midpoint formula; Distance formula; Finding an endpoint | midpoint formula; distance formula
- Measuring and Classifying Angles | Angles are measured in degrees and classified as acute, right, obtuse, or straight. | Protractor postulate; Angle addition; Angle bisectors | classifying angles; angle addition postulate
- Angle Pairs | Complementary, supplementary, vertical, and linear pairs. | Vertical angles; Linear pairs; Complements and supplements | angle pairs; vertical angles; complementary and supplementary angles
- Basic Constructions | A compass and straightedge copy segments and angles and build bisectors. | Copying a segment and angle; Perpendicular bisector; Angle bisector | geometric constructions; compass and straightedge

# Reasoning and Proof | Conditional statements and writing proofs.
- Inductive and Deductive Reasoning | Patterns suggest conjectures; deductive reasoning proves them. | Conjectures; Counterexamples; Law of detachment and syllogism | inductive reasoning; deductive reasoning
- Conditional Statements | If-then statements and their converse, inverse, and contrapositive. | Hypothesis and conclusion; Converse, inverse, contrapositive; Biconditionals | conditional statements; converse inverse contrapositive
- Algebraic Proof | Properties of equality justify each step of solving an equation. | Properties of equality; Reflexive, symmetric, transitive; Two-column format | algebraic proofs
- Proving Segment and Angle Relationships | Two-column proofs of segment and angle facts, like vertical angles being congruent. | Writing two-column proofs; Paragraph and flow proofs; Angle theorems | two column proofs; geometry proofs
+ Indirect Proof | Assume the opposite of what you want to prove and reach a contradiction. | Proof by contradiction; Writing the assumption; Indirect proofs with inequalities | indirect proof; proof by contradiction

# Parallel and Perpendicular Lines | Transversals, angle relationships, and slopes.
- Parallel Lines and Transversals | A transversal creates corresponding, alternate interior, and same-side angles. | Corresponding angles; Alternate interior and exterior; Same-side interior | parallel lines cut by a transversal; transversal angles
- Proving Lines Parallel | The converses of the transversal theorems prove two lines are parallel. | Converse theorems; Writing the proof; Using algebra | proving lines parallel
- Perpendicular Lines and Distance | Perpendicular lines form right angles; the shortest distance to a line is perpendicular. | Perpendicular transversal theorem; Distance from a point to a line; Perpendicular bisectors | perpendicular lines
- Slopes of Parallel and Perpendicular Lines | Equal slopes mean parallel; negative reciprocal slopes mean perpendicular. | Comparing slopes; Writing equations; Coordinate proofs | slopes of parallel and perpendicular lines

# Transformations | Rigid motions, dilations, and symmetry.
- Translations | A translation slides every point the same distance in the same direction. | Translation vectors; Coordinate rules; Mapping notation | translations
- Reflections | A reflection flips a figure over a line, keeping distances the same. | Reflecting over the axes; Reflecting over y = x; Line of reflection | reflections
- Rotations | A rotation turns a figure around a center point by a set angle. | 90, 180, and 270 degree rules; Center of rotation; Clockwise vs. counterclockwise | rotations
- Compositions of Transformations | Doing one transformation after another; order can matter. | Glide reflections; Two reflections make a rotation or translation; Mapping a figure | composition of transformations
- Symmetry | Line and rotational symmetry describe when a figure maps onto itself. | Lines of symmetry; Rotational symmetry; Order of symmetry | line symmetry; rotational symmetry
- Dilations | A dilation scales a figure from a center by a scale factor, keeping its shape. | Scale factor; Center of dilation; Enlargements and reductions | dilations

# Congruent Triangles | Triangle angle facts and proving triangles congruent.
- Triangle Angle Sum and Exterior Angles | Interior angles of a triangle add to 180°; an exterior angle equals the two remote interior angles. | Triangle sum theorem; Exterior angle theorem; Classifying triangles | triangle angle sum theorem; exterior angle theorem
- Congruence and Rigid Motions | Two figures are congruent when a sequence of rigid motions maps one onto the other. | Corresponding parts; Congruence statements; Rigid motion definition | congruent figures; congruence transformations
- Proving Triangles Congruent: SSS and SAS | Three sides, or two sides and the included angle, prove two triangles congruent. | SSS; SAS; Included angles | sss and sas; triangle congruence
- Proving Triangles Congruent: ASA, AAS, and HL | Two angles and a side, or a right triangle's hypotenuse and leg, also prove congruence. | ASA; AAS; HL for right triangles | asa and aas; hl theorem
- Using CPCTC | Once triangles are congruent, all their corresponding parts are too. | CPCTC; Multi-step proofs; Overlapping triangles | cpctc
- Isosceles and Equilateral Triangles | Base angles of an isosceles triangle are congruent; equilateral triangles are equiangular. | Base angles theorem; Converse; Equilateral triangles | isosceles triangle theorem; isosceles and equilateral triangles

# Relationships Within Triangles | Midsegments, bisectors, centers, and triangle inequalities.
- Midsegments of Triangles | A midsegment is parallel to the third side and half as long. | Triangle midsegment theorem; Coordinate midsegments; Applications | triangle midsegment theorem
- Perpendicular and Angle Bisectors | Points on a perpendicular bisector are equidistant from the endpoints; points on an angle bisector are equidistant from the sides. | Perpendicular bisector theorem; Angle bisector theorem; Converses | perpendicular bisector theorem; angle bisector theorem
- Points of Concurrency | Circumcenter, incenter, centroid, and orthocenter are where a triangle's special segments meet. | Circumcenter and incenter; Centroid and medians; Orthocenter and altitudes | points of concurrency; centroid circumcenter incenter orthocenter
- Triangle Inequalities | The longest side is opposite the largest angle, and any two sides must add to more than the third. | Triangle inequality theorem; Side-angle relationships; Hinge theorem | triangle inequality theorem

# Polygons and Quadrilaterals | Polygon angles and the properties of special quadrilaterals.
- Angles of Polygons | Interior angles add to (n - 2)·180°; exterior angles always add to 360°. | Interior angle sum; Regular polygons; Exterior angle sum | interior angles of polygons; polygon angle sum
- Properties of Parallelograms | Opposite sides and angles are congruent and the diagonals bisect each other. | Opposite sides and angles; Diagonals; Consecutive angles | properties of parallelograms
- Proving a Quadrilateral Is a Parallelogram | Five different tests show a quadrilateral is a parallelogram. | Converse theorems; One pair of sides both parallel and congruent; Coordinate proofs | proving parallelograms
- Rectangles, Rhombuses, and Squares | Special parallelograms add congruent diagonals, perpendicular diagonals, or both. | Diagonal properties; Classifying; Using algebra | rhombus rectangle square
- Trapezoids and Kites | Trapezoids have one pair of parallel sides; kites have two pairs of consecutive congruent sides. | Isosceles trapezoids; Trapezoid midsegment; Kite diagonals | trapezoids and kites
- Coordinate Proofs | Slope, distance, and midpoint prove properties of figures on the coordinate plane. | Placing figures; Proving with slope and distance; Classifying quadrilaterals | coordinate geometry proofs

# Similarity | Similar figures and proportional reasoning.
- Similar Polygons | Similar figures have congruent angles and proportional sides. | Scale factor; Similarity statements; Perimeter ratios | similar polygons; similar figures
- Proving Triangles Similar | AA, SSS, and SAS similarity prove two triangles are similar. | AA similarity; SSS and SAS similarity; Indirect measurement | aa similarity; proving triangles similar
- Proportions in Triangles | A line parallel to one side divides the other two proportionally. | Triangle proportionality theorem; Angle bisector proportions; Parallel lines and transversals | triangle proportionality theorem; side splitter theorem
- Similar Right Triangles | The altitude to the hypotenuse makes three similar triangles and the geometric mean. | Geometric mean; Altitude to the hypotenuse; Leg relationships | similar right triangles; geometric mean

# Right Triangles and Trigonometry | The Pythagorean theorem, special right triangles, and trig ratios.
- The Pythagorean Theorem and Its Converse | a² + b² = c² finds missing sides; the converse classifies triangles. | Pythagorean triples; Converse; Acute, right, or obtuse | pythagorean theorem; converse of the pythagorean theorem
- Special Right Triangles | 45-45-90 and 30-60-90 triangles have fixed side ratios. | 45-45-90; 30-60-90; Using the ratios | special right triangles; 30 60 90 triangle; 45 45 90 triangle
- Trigonometric Ratios | Sine, cosine, and tangent compare the sides of a right triangle (SOH CAH TOA). | SOH CAH TOA; Finding missing sides; Sine and cosine of complements | trigonometric ratios; soh cah toa
- Solving Right Triangles | Inverse trig finds missing angles; trig ratios find missing sides. | Inverse trig functions; Solving completely; Calculator mode | solving right triangles; inverse trig
- Angles of Elevation and Depression | Real problems like heights of buildings use trig with elevation and depression angles. | Angle of elevation; Angle of depression; Word problems | angle of elevation and depression
+ The Law of Sines | Ratios of sides to the sines of their opposite angles solve any triangle with an angle-side pair. | Law of sines; AAS and ASA; The ambiguous case | law of sines
+ The Law of Cosines | A generalized Pythagorean theorem solves triangles given SAS or SSS. | Law of cosines; SSS and SAS; Choosing a law | law of cosines
+ Area of a Triangle with Sine | Area = ½ab·sin C finds area from two sides and the included angle. | ½ab sin C; Heron's formula; Applications | area of a triangle using sine
+ Vectors | Vectors have magnitude and direction and are added tip to tail. | Component form; Magnitude and direction; Adding vectors | vectors geometry

# Circles | Arcs, angles, segments, and equations of circles.
- Parts of a Circle and Arcs | Central angles determine arc measures; arcs are minor, major, or semicircles. | Radius, chord, diameter; Central angles; Arc measure | arcs and central angles; parts of a circle
- Arc Length and Radian Measure | Arc length is a fraction of the circumference; radians measure angles by arc length. | Arc length formula; Converting to radians; Similar circles | arc length; radians
- Area of Sectors | A sector's area is the same fraction of the circle's area as its arc. | Sector area formula; Segments of circles; Applications | area of a sector
- Inscribed Angles | An inscribed angle is half its intercepted arc. | Inscribed angle theorem; Angles in a semicircle; Inscribed quadrilaterals | inscribed angles
- Tangent Lines | A tangent is perpendicular to the radius at the point of tangency. | Tangent and radius; Two tangents from a point; Circumscribed angles | tangent lines to circles
- Chords, Secants, and Tangents | Angles and segment lengths formed by chords, secants, and tangents follow set rules. | Angles inside and outside; Intersecting chords; Secant-secant and tangent-secant | segments in circles; secants and tangents
- Equations of Circles | (x - h)² + (y - k)² = r² gives a circle's center and radius. | Standard form; Completing the square; Graphing | equation of a circle
+ Parabolas from Focus and Directrix | A parabola is every point equidistant from a focus and a directrix. | Focus and directrix; Deriving the equation; Graphing | focus and directrix of a parabola

# Area and Volume | Measuring two- and three-dimensional figures.
- Areas of Polygons | Triangles, parallelograms, trapezoids, and regular polygons all have area formulas. | Triangles and trapezoids; Regular polygons with apothems; Composite figures | area of polygons; area of regular polygons
- Circumference and Area of Circles | C = 2πr and A = πr² measure circles. | Circumference; Area; Composite shapes | area and circumference of a circle
- Three-Dimensional Figures and Cross Sections | Slicing a solid makes a cross section; rotating a shape makes a solid. | Nets; Cross sections; Solids of revolution | cross sections of 3d shapes
- Surface Area | The surface area of prisms, cylinders, pyramids, cones, and spheres. | Prisms and cylinders; Pyramids and cones; Spheres | surface area
- Volume of Prisms and Cylinders | V = Bh, and Cavalieri's principle for oblique solids. | V = Bh; Cylinders; Cavalieri's principle | volume of prisms and cylinders
- Volume of Pyramids, Cones, and Spheres | Pyramids and cones are one-third of a prism or cylinder; spheres are (4/3)πr³. | One-third Bh; Cones; Spheres and hemispheres | volume of cones pyramids and spheres
- Similar Solids and Modeling | Scaling by k multiplies area by k² and volume by k³; density models real objects. | Area and volume ratios; Density; Design problems | similar solids; scale factor area and volume

# Probability | Counting outcomes and the rules of probability.
- Sample Spaces and Probability | Probability is favorable outcomes over possible outcomes. | Sample spaces; Theoretical vs. experimental; Complements | probability basics; sample space
- Independent and Dependent Events | Independent events multiply; dependent events change the second probability. | Multiplication rule; With and without replacement; Testing independence | independent and dependent events
- Conditional Probability | The probability of A given B uses only the outcomes where B happened. | P(A given B); Two-way tables; Tree diagrams | conditional probability
- The Addition Rule | P(A or B) = P(A) + P(B) - P(A and B). | Mutually exclusive events; Overlapping events; Venn diagrams | addition rule probability; mutually exclusive events
- Permutations and Combinations | Permutations count arrangements where order matters; combinations count groups where it doesn't. | Fundamental counting principle; nPr; nCr | permutations and combinations
+ Geometric Probability | Probability from lengths and areas: the chance a random point lands in a region. | Length probability; Area probability; Applications | geometric probability
`,
);

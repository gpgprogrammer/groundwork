import type { CourseSpec } from "../spec";

/**
 * AP Computer Science A, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const csa: CourseSpec = {
  "course": {
    "slug": "ap-computer-science-a",
    "title": "AP Computer Science A",
    "shortTitle": "AP CSA",
    "exam": "AP",
    "category": "Math & Computer Science",
    "description": "The 2025–26 College Board course in four units: using objects and methods, selection and iteration, class creation, and data collections, in Java.",
    "hue": 30,
    "examMonth": "May",
    "query": "AP Computer Science A Java",
    "keywords": [
      "ap csa",
      "ap computer science a",
      "ap comp sci a",
      "apcsa",
      "java"
    ]
  },
  "units": [
    {
      "slug": "using-objects-and-methods",
      "title": "Using Objects and Methods",
      "summary": "Variables, expressions, and calling methods on objects and classes.",
      "concepts": [
        {
          "title": "Programs and data",
          "topics": [
            {
              "slug": "algorithms-programming-and-compilers",
              "title": "Algorithms, Programming, and Compilers",
              "summary": "A program is an algorithm written in a language a computer can run; the compiler checks it and turns it into something executable.",
              "points": [
                "What an algorithm is",
                "Compile-time vs. run-time errors",
                "Writing and running Java"
              ],
              "aliases": [
                "introduction to java",
                "compiler",
                "syntax error"
              ]
            },
            {
              "slug": "variables-and-primitive-data-types",
              "title": "Variables and Primitive Data Types",
              "summary": "int, double, and boolean store values directly; each has a size and a range.",
              "aliases": [
                "java variables",
                "data types"
              ]
            },
            {
              "slug": "expressions-assignment-and-casting",
              "title": "Expressions, Assignment, and Casting",
              "summary": "Integer division truncates, % gives the remainder, and casting converts between int and double.",
              "aliases": [
                "integer division",
                "modulo",
                "casting"
              ]
            }
          ]
        },
        {
          "title": "Calling methods",
          "topics": [
            {
              "slug": "apis-libraries-and-documentation",
              "title": "APIs, Libraries, and Documentation",
              "summary": "Java's libraries are full of ready-made classes; their documentation (and your comments) say what each method does, what it needs, and what it returns.",
              "points": [
                "Application program interfaces",
                "Reading documentation",
                "Comments and preconditions"
              ],
              "aliases": [
                "api",
                "java library",
                "comments"
              ]
            },
            {
              "slug": "method-signatures-and-class-methods",
              "title": "Method Signatures and Class Methods",
              "summary": "A method signature is its name plus its parameter list. Static (class) methods are called on the class itself, like Math.sqrt(x).",
              "points": [
                "Parameters and arguments",
                "Return types and void",
                "Calling static methods"
              ],
              "aliases": [
                "method signature",
                "static methods",
                "parameters"
              ]
            },
            {
              "slug": "the-math-class-and-wrapper-classes",
              "title": "The Math Class and Wrapper Classes",
              "summary": "Math.random, Math.abs, and Math.pow are static methods; Integer and Double wrap primitives.",
              "aliases": [
                "Math.random",
                "wrapper classes",
                "autoboxing"
              ]
            },
            {
              "slug": "objects-classes-and-constructors",
              "title": "Objects, Classes, and Constructors",
              "summary": "A class is a blueprint, an object is an instance, and new calls a constructor to build it.",
              "aliases": [
                "java objects",
                "constructors"
              ]
            },
            {
              "slug": "calling-instance-methods",
              "title": "Calling Instance Methods",
              "summary": "Instance methods act on a particular object, called with dot notation. Calling one on null throws a NullPointerException.",
              "points": [
                "Dot notation",
                "Methods that return values",
                "NullPointerException"
              ],
              "aliases": [
                "instance methods",
                "null pointer exception"
              ]
            },
            {
              "slug": "string-methods",
              "title": "String Methods",
              "summary": "substring, indexOf, length, and equals are the String methods the exam uses most.",
              "aliases": [
                "java strings",
                "substring",
                "indexOf"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "selection-and-iteration",
      "title": "Selection and Iteration",
      "summary": "Making decisions with conditionals and repeating work with loops.",
      "concepts": [
        {
          "title": "Selection",
          "topics": [
            {
              "slug": "algorithms-with-selection-and-repetition",
              "title": "Algorithms with Selection and Repetition",
              "summary": "Most algorithms combine three building blocks: doing steps in order, choosing between paths, and repeating steps.",
              "points": [
                "Sequencing, selection, iteration",
                "Tracing an algorithm",
                "Planning before coding"
              ],
              "aliases": [
                "selection and repetition"
              ]
            },
            {
              "slug": "boolean-expressions",
              "title": "Boolean Expressions",
              "summary": "Relational operators like <, ==, and != compare values and produce true or false.",
              "points": [
                "Relational operators",
                "== vs. .equals",
                "Boolean variables"
              ],
              "aliases": [
                "boolean expressions",
                "relational operators"
              ]
            },
            {
              "slug": "if-else-if-and-else",
              "title": "if, else if, and else",
              "summary": "Conditionals run code only when a boolean expression is true.",
              "aliases": [
                "if statements",
                "conditionals"
              ]
            },
            {
              "slug": "compound-boolean-expressions-and-de-morgans-law",
              "title": "Compound Boolean Expressions and De Morgan's Law",
              "summary": "&& and || short-circuit, and De Morgan's laws rewrite negated compound conditions.",
              "aliases": [
                "de morgans law",
                "logical operators",
                "short circuit"
              ]
            },
            {
              "slug": "comparing-objects",
              "title": "Comparing Objects",
              "summary": "== compares references for objects; use .equals to compare their contents.",
              "aliases": [
                "equals vs ==",
                "object equality"
              ]
            }
          ]
        },
        {
          "title": "Iteration",
          "topics": [
            {
              "slug": "while-and-for-loops",
              "title": "while and for Loops",
              "summary": "Loops repeat code; watch the loop condition to avoid off-by-one errors and infinite loops.",
              "aliases": [
                "java loops",
                "for loop",
                "while loop"
              ]
            },
            {
              "slug": "implementing-selection-and-iteration-algorithms",
              "title": "Implementing Selection and Iteration Algorithms",
              "summary": "Standard loop algorithms: sums and averages, minimum and maximum, counting, and checking whether every or any value meets a condition.",
              "points": [
                "Accumulators",
                "Min and max",
                "Counting and early exit"
              ],
              "aliases": [
                "loop algorithms",
                "standard algorithms"
              ]
            },
            {
              "slug": "nested-loops-and-string-algorithms",
              "title": "Nested Loops and String Algorithms",
              "summary": "Nested loops and character-by-character traversals power counting, reversing, and searching Strings.",
              "aliases": [
                "nested loops",
                "string traversal"
              ]
            },
            {
              "slug": "informal-run-time-analysis",
              "title": "Informal Run-Time Analysis",
              "summary": "Count how many times a statement runs to compare algorithms; nested loops multiply the work.",
              "points": [
                "Statement execution counts",
                "Loops inside loops",
                "Comparing efficiency"
              ],
              "aliases": [
                "run time analysis",
                "efficiency"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "class-creation",
      "title": "Class Creation",
      "summary": "Designing your own classes: attributes, constructors, and methods.",
      "concepts": [
        {
          "title": "Class Creation",
          "topics": [
            {
              "slug": "abstraction-and-program-design",
              "title": "Abstraction and Program Design",
              "summary": "Good design hides details behind classes and methods, and breaks a problem into parts that are easier to build and test. Design choices also affect users and society.",
              "points": [
                "Abstraction",
                "Decomposition",
                "Impact of program design"
              ],
              "aliases": [
                "abstraction",
                "program design"
              ]
            },
            {
              "slug": "instance-variables-constructors-and-methods",
              "title": "Instance Variables, Constructors, and Methods",
              "summary": "Private instance variables hold state; public methods expose behavior; constructors set the initial state.",
              "aliases": [
                "writing classes",
                "encapsulation",
                "accessor mutator"
              ]
            },
            {
              "slug": "passing-and-returning-object-references",
              "title": "Passing and Returning Object References",
              "summary": "Methods receive copies of references, so a method can change the object a reference points to but not which object the caller's variable refers to.",
              "points": [
                "References vs. primitives",
                "Mutating a passed object",
                "Returning references"
              ],
              "aliases": [
                "pass by value",
                "object references"
              ]
            },
            {
              "slug": "static-variables-and-methods-and-this",
              "title": "Static Variables and Methods, and this",
              "summary": "Static members belong to the class, not an object; this refers to the current object.",
              "aliases": [
                "static keyword",
                "this keyword"
              ]
            },
            {
              "slug": "scope-and-access",
              "title": "Scope and Access",
              "summary": "Local variables live only inside their block; private hides details from other classes.",
              "aliases": [
                "variable scope",
                "private public"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "data-collections",
      "title": "Data Collections",
      "summary": "Arrays, ArrayLists, 2D arrays, searching, sorting, and recursion.",
      "concepts": [
        {
          "title": "Data and arrays",
          "topics": [
            {
              "slug": "ethics-of-data-collection",
              "title": "Ethics of Data Collection",
              "summary": "Collecting data raises questions about privacy, consent, and bias, and programmers are responsible for how data is gathered and used.",
              "points": [
                "Privacy and consent",
                "Bias in data",
                "Responsible use"
              ],
              "aliases": [
                "data ethics",
                "privacy"
              ]
            },
            {
              "slug": "introduction-to-data-sets",
              "title": "Introduction to Data Sets",
              "summary": "A data set is a collection of related values; programs answer questions about it by processing every element.",
              "points": [
                "What a data set is",
                "Questions you can ask",
                "Choosing a data structure"
              ],
              "aliases": [
                "data sets"
              ]
            },
            {
              "slug": "creating-and-traversing-arrays",
              "title": "Creating and Traversing Arrays",
              "summary": "Arrays have a fixed length, zero-based indexes, and can be traversed with for or enhanced for loops.",
              "aliases": [
                "java arrays",
                "enhanced for loop"
              ]
            },
            {
              "slug": "array-algorithms",
              "title": "Array Algorithms",
              "summary": "Find a max or min, sum, count, shift, and reverse elements with standard traversal patterns.",
              "aliases": [
                "array algorithms"
              ]
            },
            {
              "slug": "using-text-files",
              "title": "Using Text Files",
              "summary": "Programs can read data from text files with a Scanner, line by line or value by value, and must handle files that don't exist.",
              "points": [
                "File and Scanner",
                "Reading until the end",
                "Exceptions when a file is missing"
              ],
              "aliases": [
                "text files",
                "scanner file"
              ]
            }
          ]
        },
        {
          "title": "ArrayList and 2D arrays",
          "topics": [
            {
              "slug": "wrapper-classes-and-autoboxing",
              "title": "Wrapper Classes and Autoboxing",
              "summary": "Integer and Double wrap primitive values as objects so they can go in an ArrayList; Java converts between them automatically.",
              "points": [
                "Integer and Double",
                "Autoboxing and unboxing",
                "Why ArrayList needs them"
              ],
              "aliases": [
                "wrapper classes",
                "autoboxing"
              ]
            },
            {
              "slug": "arraylist-methods",
              "title": "ArrayList Methods",
              "summary": "add, get, set, remove, and size manage a list that grows and shrinks.",
              "aliases": [
                "arraylist",
                "java arraylist"
              ]
            },
            {
              "slug": "removing-while-traversing",
              "title": "Removing While Traversing",
              "summary": "Removing elements during a forward loop skips elements; loop backward or adjust the index.",
              "aliases": [
                "arraylist remove loop"
              ]
            },
            {
              "slug": "implementing-arraylist-algorithms",
              "title": "Implementing ArrayList Algorithms",
              "summary": "The same standard algorithms as arrays (sum, max, search, filter), adapted for a list that can grow and shrink.",
              "points": [
                "Traversal patterns",
                "Inserting and deleting",
                "Filtering into a new list"
              ],
              "aliases": [
                "arraylist algorithms"
              ]
            },
            {
              "slug": "2d-arrays",
              "title": "2D Arrays",
              "summary": "A 2D array is an array of rows; traverse it with nested loops in row-major or column-major order.",
              "aliases": [
                "2d arrays",
                "row major"
              ]
            }
          ]
        },
        {
          "title": "Searching, sorting, and recursion",
          "topics": [
            {
              "slug": "searching-and-sorting",
              "title": "Searching and Sorting",
              "summary": "Linear and binary search find elements; selection and insertion sort order them.",
              "aliases": [
                "selection sort",
                "insertion sort",
                "binary search",
                "linear search"
              ]
            },
            {
              "slug": "recursion",
              "title": "Recursion",
              "summary": "A recursive method needs a base case and a step that moves toward it; merge sort and binary search can be written recursively.",
              "aliases": [
                "recursive methods",
                "merge sort",
                "base case"
              ]
            },
            {
              "slug": "recursive-searching-and-sorting",
              "title": "Recursive Searching and Sorting",
              "summary": "Binary search and merge sort are naturally recursive: split the problem in half, solve the halves, and combine.",
              "points": [
                "Recursive binary search",
                "Merge sort",
                "Tracing recursive calls"
              ],
              "aliases": [
                "merge sort",
                "binary search recursion"
              ]
            }
          ]
        }
      ]
    }
  ]
};

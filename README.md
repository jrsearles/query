What is query.js?
-----------------
Query.js is a small javascript library for querying arrays.  It consists of an implementation of a **LINQ** style API to allow for the extraction and manipulation of the data within an array.  In areas that diverge from **LINQ**'s API i have tried to move closer to traditional SQL syntax, which is still the best language for querying data.

Why, you ask?  Why not, i say.  There are certainly other offerings in this area for javascript.  Some that may be more robust, more complete, better, faster, smarter and so on.  For me this was an exercise in creating a fully functional javascript library from the ground up, to get out some javascript foo and have a little fun.  Hope you find it useful!

Query.js is not browser dependent, though i have not tested it in non-browser contexts.  It contains no dependencies, however for &lt; IE9 you will need to include *legacy.js* to implement missing array functionality.  It should be performant, though i have not run it through performance tests.  Tests are included using Jasmine.

Please see the wiki section for more details.

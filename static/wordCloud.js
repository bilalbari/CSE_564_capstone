function clearWordCloudPlot() {
    console.log("Clearing plot...");
    var container = document.getElementById("wordCloudContainer");
    container.innerHTML = "";
}

function renderWordCloudPlot(sentences) {
    // var sentences = [
    //     "Garry Kasparov and his long-time rival Anatoly Karpov—two of the greatest chess players of all-time—took their respective seats around the chess board. The 1990 World Chess Championship was about to begin.",
    //     "The two men would play 24 games to decide the champion with the highest scoring player being declared the World Chess Champion. In total, the match would stretch for three months with the first 12 games taking place in New York and the final 12 games being played in Lyon, France.",
    //     "Kasparov started off well, but soon began to make mistakes. He lost the seventh game and let multiple victories slip away during the first half of the tournament. After the first 12 games, the two men left New York with the match tied at 6-6. The New York Times reported that “Mr. Kasparov had lost confidence and grown nervous in New York.”",
    //     "If Kasparov was going to retain his title as the best in the world, it was going to take everything he had.",
    //     "“Playing Kasparov Chess”",
    //     "Josh Waitzkin was a chess prodigy as a child and won multiple U.S. Junior Championships before the age of 10. Along the way, Waitzkin and his father had the opportunity to connect with Garry Kasparov and discuss chess strategy with him. In particular, they learned how Kasparov dealt with remarkably difficult matches like the one he faced against Karpov in the 1990 World Chess Championship.",
    //     "Waitzkin shares the story in his book, The Art of Learning (audiobook).",
    //     "Kasparov was a fiercely aggressive chess player who thrived on energy and confidence. My father wrote a book called Mortal Games about Garry, and during the years surrounding the 1990 Kasparov-Karpov match, we both spent quite a lot of time with him.",
    //     "At one point, after Kasparov had lost a big game and was feeling dark and fragile, my father asked Garry how he would handle his lack of confidence in the next game. Garry responded that he would try to play the chess moves that he would have played if he were feeling confident. He would pretend to feel confident, and hopefully trigger the state.",
    //     "Kasparov was an intimidator over the board. Everyone in the chess world was afraid of Garry and he fed on that reality. If Garry bristled at the chessboard, opponents would wither. So if Garry was feeling bad, but puffed up his chest, made aggressive moves, and appeared to be the manifestation of Confidence itself, then opponents would become unsettled. Step by step, Garry would feed off his own chess moves, off the created position, and off his opponent’s building fear, until soon enough the confidence would become real and Garry would be in flow…",
    //     "He was not being artificial. Garry was triggering his zone by playing Kasparov chess.",
    //     "—Josh Waitzkin, The Art of Learning",
    //     "When the second half of the World Chess Championship began in Lyon, France, Kasparov forced himself to play aggressive. He took the lead by winning the 16th game. With his confidence building, he rattled off decisive wins in the 18th and 20th games as well. When it was all said and done, Kasparov lost only two of the final 12 games and retained his title as World Chess Champion.",
    //     "He would continue to hold the title for another 10 years.",
    //     "“Fake It Until You Become It”",
    //     "It can be easy to view performance as a one-way street. We often hear about a physically gifted athlete who underperforms on the field or a smart student who flounders in the classroom. The typical narrative about underachievers is that if they could just “get their head right” and develop the correct “mental attitude” then they would perform at the top of their game.",
    //     "There is no doubt that your mindset and your performance are connected in some way. But this connection works both ways. A confident and positive mindset can be both the cause of your actions and the result of them. The link between physical performance and mental attitude is a two-way street.",
    //     "Confidence is often the result of displaying your ability. This is why Garry Kasparov’s method of playing as if he felt confident could lead to actual confidence. Kasparov was letting his actions inspire his beliefs.",
    //     "These aren’t just feel-good notions or fluffy self-help ideas. There is hard science proving the link between behavior and confidence. Amy Cuddy, a Harvard researcher who studies body language, has shown through her groundbreaking research that simply standing in more confident poses can increase confidence and decrease anxiety.",
    //     "Cuddy’s research subjects experienced actual biological changes in their hormone production including increased testosterone levels (which is linked to confidence) and decreased cortisol levels (which is linked to stress and anxiety). These findings go beyond the popular fake it until you make it philosophy. According to Cuddy, you can “fake it until you become it.”",
    //     "How to Build Confidence",
    //     "When my friend Beck Tench began her weight loss journey, she repeatedly asked herself the question, “What would a healthy person do?”",
    //     "When she was deciding what to order a restaurant: what would a healthy person order? When she was sitting around on a Saturday morning: what would a healthy person do with that time? Beck didn’t feel like a healthy person at the start, but she figured that if she acted like a healthy person, then eventually she would become one. And within a few years, she had lost over 100 pounds.",
    //     "Confidence is a wonderful thing to have, but if you find yourself overcome with fear, self-doubt, or uncertainty, then let your behavior drive your beliefs. Play as if you’re at your best. Work as if you’re on top of your game. Talk to that person as if you’re feeling confident. You can use bold actions to trigger a bold mindset.",
    //     "In short, what would a brave person do?",
    // ];

    // List of words
    // var myWords = [
    //     { word: "Running", size: "10" },
    //     { word: "Surfing", size: "20" },
    //     { word: "Climbing", size: "50" },
    //     { word: "Kiting", size: "30" },
    //     { word: "Sailing", size: "20" },
    //     { word: "Snowboarding", size: "60" },
    // ];

    clearWordCloudPlot();

    // Initialize an empty object to store word frequencies
    var wordFrequencies = {};

    // Loop through each sentence in the sentences array
    sentences.forEach(function(sentence) {
        // Remove punctuation and split the sentence into words
        var words = sentence
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/);

        // Loop through each word and update its frequency
        words.forEach(function(word) {
            // Convert word to lowercase for case-insensitive counting
            word = word.toLowerCase();

            // Exclude words with less than 3 characters
            if (word.length > 4) {
                // If the word is already in the wordFrequencies object, increment its count
                if (wordFrequencies[word]) {
                    wordFrequencies[word]++;
                }
                // Otherwise, initialize its count to 1
                else {
                    wordFrequencies[word] = 1;
                }
            }
        });
    });

    // Convert the wordFrequencies object to an array of objects
    var myWords = Object.keys(wordFrequencies).map(function(word) {
        return { word: word, size: wordFrequencies[word] };
    });

    // Optional: Sort the myWords array by word frequency (size) in descending order
    myWords.sort(function(a, b) {
        return b.size - a.size;
    });

    console.log("myWords", myWords);

    // Optional: Limit the number of words in the myWords array
    myWords = myWords.slice(0, 10); // for example, limit to the top 20 words

    // Print the resulting array
    console.log(myWords);

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = 315 - margin.left - margin.right,
        height = 255 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3
        .select("#wordCloudContainer")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout
        .cloud()
        .size([width, height])
        .words(
            myWords.map(function(d) {
                return { text: d.word, size: d.size };
            })
        )
        .padding(10) //space between words
        .rotate(function() {
            return ~~(Math.random() * 2) * 90;
            // return 0;
        })
        .fontSize(function(d) {
            return d.size;
        }) // font size of words
        .spiral("archimedean") // Spiral type
        // .random(function() {
        //     return 0.5;
        // }) // Set a constant for random layout (disables shuffling)
        // .collide(0.5) // Control word overlapping
        .on("end", draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
        // Define minimum and maximum font sizes
        var minFontSize = 10;
        var maxFontSize = 40;

        // Scale for font size
        var fontSizeScale = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(myWords, function(d) {
                    return d.size;
                }),
            ])
            .range([minFontSize, maxFontSize]);

        var fill = d3.scaleOrdinal(d3.schemeCategory20);
        svg
            .append("g")
            .attr(
                "transform",
                "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
            )
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function(d) {
                return Math.round(fontSizeScale(d.size)) + "px";
            })
            .style("fill", (d, i) => fill(i))
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) {
                return d.text;
            });
    }
}
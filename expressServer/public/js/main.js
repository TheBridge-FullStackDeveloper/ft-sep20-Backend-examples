
// ---------------- Index view (/) ----------------

async function getImage() {
  let response = await fetch('http://localhost:8080/loadImage');
  let data = await response.json();

  document.getElementById("launch").src = data.src;
}

if( window.location.pathname === "/" ) {
    document.getElementById("clickme").addEventListener("click", getImage);
}

// ---------------- Quiz view (/question) ----------------

async function checkAnswer(idQuestion, textAnswer) {
    const endpoint = `http://localhost:8889/question/${idQuestion}`;

    let response = await fetch(endpoint, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ answer: textAnswer })
    });

    let data = await response.json();

    // Draw result message
    document.getElementById("answers").innerHTML = data.result;
}

async function getQuestion(idQuestion) {
    let response = await fetch(`http://localhost:8889/question/${idQuestion}`);
    let data = await response.json();

    // Draw question
    document.getElementById("question").innerText = data.text;

    // Draw answers
    data.answers.map((answer) => {

        // Draw answer
        let newAnswer = document.createElement("li");
        let newAnswerText = document.createTextNode(answer.text);

        newAnswer.appendChild(newAnswerText);
        document.getElementById("answers").appendChild(newAnswer);

        // Bind handling event
        newAnswer.addEventListener("click", () => checkAnswer(idQuestion, answer.text));
    });
}

if( window.location.pathname === "/question" ) {
    getQuestion(0);
}
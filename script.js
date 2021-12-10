let loaded = false;

const pagesContainer = document.querySelector(".pages");
const inputFile = document.querySelector("#inputFile");

inputFile.addEventListener("change", () => {
  let files = inputFile.files;

  if (files.length == 0) return;

  const file = files[0];

  let reader = new FileReader();

  reader.addEventListener("load", (e) => {
    document.querySelector("#currentPage").value = 1;

    const fileTextContent = e.target.result;

    let linesStrings = fileTextContent
      .split("\r\n")
      .filter((line) => line.length > 0 && line !== " ")
      .join(" ");

    if (linesStrings.length === 0) return;

    const maxCharactersInRow = Math.floor(
      (+pagesContainer.clientWidth - 20) / 10
    );
    const maxLines = Math.floor((+pagesContainer.clientHeight - 20) / 17.5);

    const numToSlice = maxCharactersInRow * maxLines + maxCharactersInRow / 2;

    const processedContent = [];

    const processContent = (i) => {
      if (linesStrings.length === 0) return 1;

      const text = linesStrings.slice(0, numToSlice);

      processedContent.push([text]);

      linesStrings = linesStrings.slice(numToSlice);

      while (pagesContainer.clientHeight === pagesContainer.scrollHeight) {
        if (linesStrings.length === 0) break;

        processedContent[i] += linesStrings[0];

        pagesContainer.innerHTML = `
        <div class='page processing' id='page-${i}'>
          ${processedContent[i]}
        </div>
      `;

        if (pagesContainer.clientHeight === pagesContainer.scrollHeight) {
          linesStrings = linesStrings.slice(1);
        } else {
          processedContent[i] = processedContent[i].slice(0, -1);

          break;
        }
      }

      return 0;
    };

    const showContent = () => {
      const page = +document.querySelector("#currentPage").value;

      pagesContainer.innerHTML = `
        <div class='page' id='page-${page}'>
          ${processedContent[page - 1]}
        </div>
      `;
    };

    let counter = 0;
    while (true) {
      if (processContent(counter) === 1) break;

      pagesContainer.innerHTML = "processing...";

      counter++;
    }

    showContent();

    const setHandler = (selector, num) => {
      document.querySelector(selector).addEventListener("click", () => {
        const page = document.querySelector("#currentPage");

        if (num === null) {
          if (selector === "#firstPage") {
            page.value = 1;
          } else if (selector === "#lastPage") {
            page.value = processedContent.length;
          }

          showContent();
        } else if (
          (+page.value < processedContent.length && num === 1) ||
          (+page.value > 1 && num === -1)
        ) {
          page.value = +page.value + num;

          showContent();
        }
      });
    };

    if (!loaded) {
      loaded = true;

      setHandler("#prevPage", -1);
      setHandler("#nextPage", 1);
      setHandler("#firstPage", null);
      setHandler("#lastPage", null);

      document.querySelector("#currentPage").addEventListener("input", () => {
        const page = document.querySelector("#currentPage");

        if (page.value <= 0) {
          page.value = 1;
        } else if (page.value > processedContent.length) {
          page.value = processedContent.length;
        }

        showContent();
      });
    }
  });

  reader.onerror = (e) => alert(e.target.error.name);

  reader.readAsText(file);
});
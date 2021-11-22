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
    const maxLines = Math.floor((+pagesContainer.clientHeight - 20) / 17);

    const processedContent = [];

    const processContent = () => {
      if (linesStrings.length === 0) return 1;

      const numToSlice = maxCharactersInRow * maxLines + maxCharactersInRow / 2;

      const text = linesStrings.slice(0, numToSlice);

      processedContent.push([text]);

      linesStrings = linesStrings.slice(numToSlice);

      return 1;
    };

    const helper = () => {
      const page = +document.querySelector("#currentPage").value;

      for (let i = 0; i <= page; i++) {
        if (processContent() === 1) continue;
      }

      pagesContainer.innerHTML = `
        <div class='page' id='page-${page}'>
          ${processedContent[page - 1]}
        </div>
      `;
    };

    helper();

    const setHandler = (selector, num) => {
      document.querySelector(selector).addEventListener("click", () => {
        const page = document.querySelector("#currentPage");

        if (
          (+page.value < processedContent.length && num === 1) ||
          (+page.value > 1 && num === -1)
        ) {
          page.value = +page.value + num;

          helper();
        }
      });
    };

    if (!loaded) {
      setHandler("#nextPage", 1);
      setHandler("#prevPage", -1);

      loaded = true;

      document.querySelector("#currentPage").addEventListener("input", () => {
        const page = document.querySelector("#currentPage");

        if (page.value <= 0) {
          page.value = 1;
        } else if (page.value > processedContent.length) {
          page.value = processedContent.length;
        } else {
          helper();
        }
      });
    }
  });

  reader.onerror = (e) => alert(e.target.error.name);

  reader.readAsText(file);
});
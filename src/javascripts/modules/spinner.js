export const showSpinner = () => {
  // const loading = document.getElementById("loading");
  // loading.currentTime = 0;
  // loading.style.display = "block";

  const container = document.querySelector("#container");
  container.style.display = "block";

  const spinner = document.querySelector(".spinner");
  spinner.style.display = "block";
  // container.className = "nowloading";
  // container.style.backgroundImage = `url(/images/loading.small.gif?${new Date().getTime()})`;
  // container.style.backgroundRepeat = "no-repeat";
  // container.style.backgroundPosition = "center";
  // container.style.backgroundSize = "50px";
  // container.style.minHeight = "65px";
  // container.style.backgroundImage = "url(/images/loading.small.gif)";
};

export const hideSpinner = () => {
  // const loading = document.getElementById("loading");
  // loading.style.display = "none";

  const container = document.getElementById("container");
  container.style.display = "block";

  const spinner = document.querySelector(".spinner");
  spinner.style.display = "none";

  // const search = document.getElementById("search-root");
  // if (search) {
  //   container.style.display = "none";
  // }
};

export const showSpinner = () => {
  const loading = document.getElementById("loading");
  loading.currentTime = 0;
  loading.style.display = "block";
};

export const hideSpinner = () => {
  const loading = document.getElementById("loading");
  loading.style.display = "none";
};

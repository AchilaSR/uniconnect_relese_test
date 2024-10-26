import { buildURI } from "./core";

export const downloadCSV = (data, headers, fileName = "Csv Report") => {
  const fileNameWithExtension = fileName + ".csv";
  const url = buildURI(data, headers);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileNameWithExtension);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

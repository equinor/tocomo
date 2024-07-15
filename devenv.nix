{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

let

  backendBaseUrl = "http://localhost:5005/";
in
{
  env.VITE_BACKEND_BASEURL = backendBaseUrl;

  languages.python = {
    enable = true;
    venv.enable = true;
    venv.requirements = ''
      fastapi[all]
      uvicorn
      pandas
      matplotlib
      seaborn
    '';
  };

  languages.javascript = {
    enable = true;
    npm.enable = true;
    directory = ./frontend;
  };

  processes.backend.exec = ''
    cd ${config.devenv.root}/backend
    uvicorn main:app --host 0.0.0.0 --port 5005 --reload
  '';

  processes.frontend.exec = ''
    cd ${config.devenv.root}/frontend
    npm run dev
  '';

  pre-commit.hooks = {
    nixfmt.enable = true;
    nixfmt.package = pkgs.nixfmt-rfc-style;
  };

  enterShell = ''
    # echo "BACKEND_BASEURL=${backendBaseUrl}" > ${config.devenv.root}/frontend/.env
  '';
}

{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  env.VITE_BACKEND_BASEURL = "http://localhost:5005/";

  languages.javascript = {
    directory = "./frontend";
    enable = true;

    npm.enable = true;
    npm.install.enable = true;
  };

  languages.python = {
    directory = "./backend";
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
}

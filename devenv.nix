{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  env.VITE_BACKEND_BASEURL = "http://localhost:5005/";
  # process.implementation = "overmind";

  languages.javascript = {
    directory = "frontend";
    enable = true;

    npm.enable = true;
    npm.install.enable = true;
  };

  languages.python = {
    directory = "backend";
    enable = true;

    poetry.enable = true;
  };

  processes.backend.exec = ''
    cd ${config.devenv.root}/backend
    poetry run uvicorn main:app --host 0.0.0.0 --port 5005 --reload
  '';

  processes.frontend.exec = ''
    cd ${config.devenv.root}/frontend
    npm run dev
  '';

  enterTest = ''
    cd backend
    poetry run pytest tests
    poetry run mypy --strict src
  '';

  pre-commit.hooks = {
    black.enable = true;

    nixfmt.enable = true;
    nixfmt.package = pkgs.nixfmt-rfc-style;

    prettier.enable = true;
    prettier.settings.parser = "typescript";
    prettier.files = ".tsx?$";
  };
}

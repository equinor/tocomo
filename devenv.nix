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

    package = pkgs.python312;
    poetry.enable = true;
    poetry.install.enable = true;
  };

  processes.backend.exec = "
    export PYTHONPATH=$PWD/backend/src:$PYTHONPATH
    python -m tocomo
  ";

  processes.frontend.exec = ''
    cd ${config.devenv.root}/frontend
    npm run dev
  '';

  enterTest = ''
    cd ${config.devenv.root}/backend
    pytest tests
    mypy --strict src

    cd ${config.devenv.root}/frontend
    npm run lint
    npm run build
  '';

  git-hooks.hooks = {
    black.enable = true;

    nixfmt-rfc-style.enable = true;

    prettier.enable = true;
    prettier.settings.parser = "typescript";
    prettier.files = ".tsx?$";
  };
}

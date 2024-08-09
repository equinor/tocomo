import { useReducer } from "react";

interface Input {
  inputs: { [key: string]: string };
}

function reducer(state: Input, action: string) {}

const [currentInput, currentInputDispatch] = useReducer<Input>(reducer, {
  inputs: {},
});

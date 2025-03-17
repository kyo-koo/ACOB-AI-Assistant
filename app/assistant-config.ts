export let assistantId = "asst_SnRuGNxq7U7uryBtKEuqbvkl"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
};
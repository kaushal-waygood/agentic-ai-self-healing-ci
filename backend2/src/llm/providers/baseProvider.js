export class BaseLLMProvider {
  constructor({ apiKey, model }) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt, options) {
    throw new Error('generate() not implemented');
  }
}

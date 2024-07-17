class Queue {
  private queue: any[] = [];
  private isProcessing: boolean = false;

  constructor() {}

  public add(item: any) {
    this.queue.push(item);
    if (!this.isProcessing) {
      this.process();
    }
  }

  public async process() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      await item();
    }
    this.isProcessing = false;
  }
}

export default Queue;
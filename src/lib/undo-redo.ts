export interface HistoryState {
  containers: any[]
  timestamp: number
  action: string
}

export class UndoRedoManager {
  private history: HistoryState[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50

  saveState(containers: any[], action: string): void {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    this.history.push({
      containers: JSON.parse(JSON.stringify(containers)),
      timestamp: Date.now(),
      action
    })

    this.currentIndex = this.history.length - 1
    
    if (this.history.length > this.maxHistorySize) {
      const removedCount = this.history.length - this.maxHistorySize
      this.history = this.history.slice(removedCount)
      this.currentIndex = this.history.length - 1
    }
  }

  undo(): HistoryState | null {
    if (this.canUndo()) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  redo(): HistoryState | null {
    if (this.canRedo()) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  getHistoryInfo(): { length: number; currentIndex: number; canUndo: boolean; canRedo: boolean } {
    return {
      length: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }
  }
}

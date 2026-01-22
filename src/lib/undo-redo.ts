/**
 * Undo/Redo functionality for inventory management
 */

export interface HistoryState {
  containers: any[]
  timestamp: number
  action: string
}

export class UndoRedoManager {
  private history: HistoryState[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50

  /**
   * Save a new state to history
   */
  saveState(containers: any[], action: string): void {
    // Remove any states after current index (when undoing and then making a new change)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Add new state
    this.history.push({
      containers: JSON.parse(JSON.stringify(containers)), // Deep clone
      timestamp: Date.now(),
      action
    })

    // Update currentIndex to point to the newly added state
    this.currentIndex = this.history.length - 1
    
    // Limit history size (remove oldest states if needed)
    if (this.history.length > this.maxHistorySize) {
      const removedCount = this.history.length - this.maxHistorySize
      this.history = this.history.slice(removedCount)
      this.currentIndex = this.history.length - 1
    }
  }

  /**
   * Undo - go back one state
   */
  undo(): HistoryState | null {
    if (this.canUndo()) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * Redo - go forward one state
   */
  redo(): HistoryState | null {
    if (this.canRedo()) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Get current state
   */
  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  /**
   * Get history info for debugging
   */
  getHistoryInfo(): { length: number; currentIndex: number; canUndo: boolean; canRedo: boolean } {
    return {
      length: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }
  }
}

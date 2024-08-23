import Foundation

protocol QueueManagerDelegate: AnyObject {
    func onReceivedFirstItem()
    func onCurrentItemChanged()
    func onSkippedToSameCurrentItem()
}

class QueueManager<Element> {

    fileprivate let recursiveLock = NSRecursiveLock()

    fileprivate func synchronizeThrows<T>(action: () throws -> T) throws -> T {
        recursiveLock.lock()
        let result = try action()
        recursiveLock.unlock()
        return result
    }

    fileprivate func synchronize <T>(action: () -> T) -> T {
        recursiveLock.lock()
        let result = action()
        recursiveLock.unlock()
        return result
    }

    weak var delegate: QueueManagerDelegate? = nil

    var _currentIndex: Int = -1
    /**
     The index of the current item. `-1` when there is no current item
     */
    private(set) var currentIndex: Int {
        get {
            return synchronize {
                return _currentIndex
            }
        }

        set {
            return synchronize {
                self._currentIndex = newValue
            }
        }
    }

    /**
     All items held by the queue.
     */
    private(set) var items: [Element] = [] {
        didSet {
            return synchronize {
                if oldValue.count == 0 && items.count > 0 {
                    delegate?.onReceivedFirstItem()
                }
            }
        }
    }

    public var nextItems: [Element] {
        return synchronize {
            return currentIndex == -1 || currentIndex == items.count - 1
                ? []
                : Array(items[currentIndex + 1..<items.count])
        }
    }

    public var previousItems: [Element] {
        return synchronize {
            return currentIndex <= 0
            ? []
            : Array(items[0..<currentIndex])
        }
    }

    /**
     The current item for the queue.
     */
    public var current: Element? {
        return synchronize {
            return 0 <= _currentIndex && _currentIndex < items.count ? items[_currentIndex] : nil
        }
    }

    private func throwIfQueueEmpty() throws {
        if items.count == 0 {
            throw AudioPlayerError.QueueError.empty
        }
    }

    private func throwIfIndexInvalid(
        index: Int,
        name: String = "index",
        min: Int? = nil,
        max: Int? = nil
    ) throws {
        guard index >= (min ?? 0) && (max ?? items.count) > index else {
            throw AudioPlayerError.QueueError.invalidIndex(
                index: index,
                message: "\(name.prefix(1).uppercased() + name.dropFirst())) has to be positive and smaller than the count of current items (\(items.count))"
            )
        }
    }

    /**
     Add a single item to the queue.

     - parameter item: The `AudioItem` to be added.
     */
    public func add(_ item: Element) {
        synchronize {
            items.append(item)
        }
    }

    /**
     Add an array of items to the queue.

     - parameter items: The `AudioItem`s to be added.
     */
    public func add(_ items: [Element]) {
        synchronize {
            if (items.count == 0) { return }
            self.items.append(contentsOf: items)
        }
    }

    /**
     Add an array of items to the queue at a given index.

     - parameter items: The `AudioItem`s to be added.
     - parameter at: The index to insert the items at.
     */
    public func add(_ items: [Element], at index: Int) throws {
        try synchronizeThrows {
            if (items.count == 0) { return }
            guard index >= 0 && self.items.count >= index else {
                throw AudioPlayerError.QueueError.invalidIndex(index: index, message: "Index to insert at has to be non-negative and equal to or smaller than the number of items: (\(items.count))")
            }
            // Correct index when items were inserted in front of it:
            if (self.items.count > 0 && currentIndex >= index) {
                currentIndex += items.count
            }
            self.items.insert(contentsOf: items, at: index)
        }
    }

    /**
     Jump to a position in the queue.
     Will update the current item.

     - parameter index: The index to jump to.
     - throws: `AudioPlayerError.QueueError`
     - returns: The item at the index.
     */
    @discardableResult
    public func jump(to index: Int) throws -> Element {
        var skippedToSameCurrentItem = false
        var currentItemChanged = false
        let result = try synchronizeThrows {
            try throwIfQueueEmpty();
            try throwIfIndexInvalid(index: index)

            if (index == currentIndex) {
                skippedToSameCurrentItem = true
            } else {
                currentIndex = index
                currentItemChanged = true
            }
            return current!
        }
        if (skippedToSameCurrentItem) {
            delegate?.onSkippedToSameCurrentItem()
        }
        if (currentItemChanged) {
            delegate?.onCurrentItemChanged()
        }
        return result
    }

    /**
     Move an item in the queue.

     - parameter fromIndex: The index of the item to be moved.
     - parameter toIndex: The index to move the item to. If the index is larger than the size of the queue, the item is moved to the end of the queue instead.
     - throws: `AudioPlayerError.QueueError`
     */
    public func moveItem(fromIndex: Int, toIndex: Int) throws {
        try synchronizeThrows {
            try throwIfQueueEmpty();
            try throwIfIndexInvalid(index: fromIndex, name: "fromIndex")
            try throwIfIndexInvalid(index: toIndex, name: "toIndex", max: Int.max)

            let item = items.remove(at: fromIndex)
            self.items.insert(item, at: min(items.count, toIndex));
            if (fromIndex == currentIndex) {
                currentIndex = toIndex;
            }
        }
    }

    /**
     Remove an item.

     - parameter index: The index of the item to remove.
     - throws: AudioPlayerError.QueueError
     - returns: The removed item.
     */
    @discardableResult
    public func removeItem(at index: Int) throws -> Element {
        var currentItemChanged = false
        let result = try synchronizeThrows {
            try throwIfQueueEmpty()
            try throwIfIndexInvalid(index: index)
            let result = items.remove(at: index)
            if index == currentIndex {
                currentIndex = items.count > 0 ? currentIndex % items.count : -1
                currentItemChanged = true
            } else if index < currentIndex {
                currentIndex -= 1
            }

            return result;
        }
        if (currentItemChanged) {
            delegate?.onCurrentItemChanged()
        }
        return result
    }

    /**
     Replace the current item with a new one. If there is no current item, it is equivalent to calling `add(item:)`, `jump(to: itemIndex)`.

     - parameter item: The item to set as the new current item.
     */
    public func replaceCurrentItem(with item: Element) {
        var currentItemChanged = false
        synchronize {
            if currentIndex == -1  {
                add(item)
                if (currentIndex == -1) {
                    currentIndex = items.count - 1
                }
            } else {
                items[currentIndex] = item
                currentItemChanged = true
            }
        }
        if (currentItemChanged) {
            delegate?.onCurrentItemChanged()
        }
    }

    /**
     Remove all previous items in the queue.
     If no previous items exist, no action will be taken.
     */
    public func removePreviousItems() {
        synchronize {
            if (items.count == 0) { return };
            guard currentIndex > 0 else { return }
            items.removeSubrange(0..<currentIndex)
            currentIndex = 0
        }
    }

    /**
     Remove upcoming items.
     If no upcoming items exist, no action will be taken.
     */
    public func removeUpcomingItems() {
        synchronize {
            if (items.count == 0) { return };
            let nextIndex = currentIndex + 1
            guard nextIndex < items.count else { return }
            items.removeSubrange(nextIndex..<items.count)
        }
    }

    /**
     Removes all items for queue
     */
    public func clearQueue() {
        var currentItemChanged = false
        synchronize {
            let itemWasNil = currentIndex == -1;
            currentIndex = -1
            items.removeAll()
            currentItemChanged = !itemWasNil
        }
        if (currentItemChanged) {
            delegate?.onCurrentItemChanged()
        }
    }

}

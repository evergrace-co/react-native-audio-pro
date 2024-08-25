import Foundation

// Protocol defining a type that can execute work asynchronously with specific flags
public protocol DispatchQueueType {
    // Method to asynchronously execute a block of code with the specified flags
    // - Parameters:
    //   - flags: DispatchWorkItemFlags used to specify how the work should be executed
    //   - work: The block of code to be executed asynchronously
    func async(flags: DispatchWorkItemFlags, execute work: @escaping @convention(block) () -> Void)
}

// Extension to make DispatchQueue conform to DispatchQueueType
extension DispatchQueue: DispatchQueueType {
    // Implementation of the async method for DispatchQueue
    // - Parameters:
    //   - flags: DispatchWorkItemFlags used to control the execution behavior (e.g., barrier, detached)
    //   - work: The block of code to execute asynchronously
    // This method leverages DispatchQueue's async method to perform the work with the given flags
    public func async(flags: DispatchWorkItemFlags, execute work: @escaping @convention(block) () -> Void) {
        async(group: nil, qos: .unspecified, flags: flags, execute: work)
    }
}

// Importing the RCTBridgeModule, which is used to expose native modules to JavaScript in React Native.
// This allows Objective-C or Swift code to be called directly from JavaScript.
#import <React/RCTBridgeModule.h>

// Importing RCTEventEmitter, which is used to send events from native code to JavaScript in React Native.
// This is particularly useful for sending asynchronous events, like notifications or progress updates.
#import <React/RCTEventEmitter.h>

// Importing RCTConvert, which is a utility used to convert between Objective-C types and their JavaScript equivalents.
// It provides a set of methods to convert JSON-like structures to native Objective-C types.
#import <React/RCTConvert.h>

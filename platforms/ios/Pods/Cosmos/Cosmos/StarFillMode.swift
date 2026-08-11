import Foundation

/**

Defines how the star is filled when the rating is not an integer number. For example, if rating is 4.6 and the fill more is Half, the star will appear to be half filled.

*/
@objc public enum StarFillMode: Int, RawRepresentable {
  /// Show only fully filled stars. For example, fourth star will be empty for 3.2.
  case full

  /// Show fully filled and half-filled stars. For example, fourth star will be half filled for 3.6.
  case half

  /// Fill star according to decimal rating. For example, fourth star will be 20% filled for 3.2.
  case precise

  public typealias RawValue = Int
  public var rawValue: RawValue{
        switch self {
        case .half:
            return 1;
        case .precise:
            return 2;
        default:
            return 0;
        }
  }
  public init?(rawValue: RawValue){
        switch rawValue {
        case 1:
            self = .half;
        case 2:
            self = .precise;
        default:
            self = .full;
        }
  }
}

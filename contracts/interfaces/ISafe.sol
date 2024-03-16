// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import {Enum} from "../common/Enum.sol";

/**
 * @dev Interface of the Safe contract to call the function externally.
 */
interface ISafe{
    function execTransactionFromModule(
            address to,
            uint256 value,
            bytes memory data,
            Enum.Operation operation
        ) external returns (bool success);
}

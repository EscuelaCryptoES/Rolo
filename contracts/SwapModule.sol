// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.17;

import {Enum} from "./common/Enum.sol";
import {ISafe} from "./interfaces/ISafe.sol";
import {IERC20} from "./interfaces/IERC20.sol";

/// @title  SwapModule
/// @notice Module to configure users gnosis accounts and transfer tokens to valut/account
contract SwapModule {
    event TransferToGnosisExecuted(address from, address to, uint256 amount);

    struct swapConfig{
        address tokenIn;
        address tokenOut;
        address gnosisPayAccount;
        address safeAddress;
    }

    address public tenderlySigner;
    mapping(address => swapConfig) public safeConfigs;

    constructor(address _tenderlySigner) {
        require(_tenderlySigner != address(0), "Invalid Gnosis Safe address");
        tenderlySigner = _tenderlySigner;
    }

    function configUserSafe(swapConfig calldata userSafeConfig) external{
        require(safeConfigs[msg.sender].gnosisPayAccount == address(0), "User already configured, call modify");
        safeConfigs[msg.sender] = userSafeConfig;
    }

    function modifyUserSafe(swapConfig calldata userSafeConfig) external{
        safeConfigs[msg.sender] = userSafeConfig;
    }

    function executeSwap(uint256 _amount, address _userToSwap) external {
        require(
            msg.sender == tenderlySigner,
            "Only the Safe may do swaps"
        );
        require(safeConfigs[_userToSwap].gnosisPayAccount != address(0), "User gnosis is address(0)");
        require(safeConfigs[_userToSwap].tokenIn != address(0), "User tokenIn is address(0)");
        require(safeConfigs[_userToSwap].tokenOut != address(0), "User tokenOut is address(0)");
        require(IERC20(safeConfigs[_userToSwap].tokenIn).balanceOf(_userToSwap) >= _amount, "Trying to swap more tokens that the user has");

        // transfer tokens from source to safe
        bytes memory transferToGnosisTx = abi.encodeWithSelector(
            IERC20.transferFrom.selector,
            _userToSwap,
            safeConfigs[_userToSwap].gnosisPayAccount,
            _amount
        );
        require(
            ISafe(safeConfigs[_userToSwap].safeAddress).execTransactionFromModule(
                safeConfigs[_userToSwap].tokenIn,
                0,
                transferToGnosisTx,
                Enum.Operation.Call
            ),
            "token transfer to gnosis failed"
        );

        emit TransferToGnosisExecuted(_userToSwap, safeConfigs[_userToSwap].gnosisPayAccount, _amount);
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.17;

import {Enum} from "./common/Enum.sol";
import {ISafe} from "./interfaces/ISafe.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import { IVault } from "./interfaces/IVault.sol";
import { IAsset } from "./interfaces/IAsset.sol";

/// @title  SwapModule
/// @notice Module to configure users gnosis accounts and transfer tokens to valut/account
contract SwapModule {
    event TransferToGnosisExecuted(address from, address to, uint256 amount);
    event ApproveExecuted(address safe, address spender, uint256 amount);

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

    function executeSimpleSwap(uint256 _amount, address _userToSwap) external {
        require(
            msg.sender == tenderlySigner,
            "Only the Safe may do swaps"
        );
        require(safeConfigs[_userToSwap].gnosisPayAccount != address(0), "User gnosis is address(0)");
        require(safeConfigs[_userToSwap].tokenIn != address(0), "User tokenIn is address(0)");
        require(safeConfigs[_userToSwap].tokenOut != address(0), "User tokenOut is address(0)");
        require(IERC20(safeConfigs[_userToSwap].tokenIn).balanceOf(_userToSwap) >= _amount, "Trying to swap more tokens that the user has");

        IVault.SingleSwap memory singleSwap = IVault.SingleSwap({
            poolId: bytes32(0xDD439304A77F54B1F7854751AC1169B279591EF7000000000000000000000064),
            kind: IVault.SwapKind.GIVEN_IN,
            assetIn: IAsset(safeConfigs[_userToSwap].tokenIn),
            assetOut: IAsset(safeConfigs[_userToSwap].tokenOut),
            amount: _amount,
            userData: "" 
        });

        IVault.FundManagement memory funds = IVault.FundManagement({
            sender: _userToSwap,
            fromInternalBalance: false,
            recipient: payable(safeConfigs[_userToSwap].gnosisPayAccount),
            toInternalBalance: false
        });

        uint256 limit = 1;
        uint256 deadline = block.timestamp + 15 minutes; // Adjust deadline as necessary

        bytes memory data = abi.encodeWithSelector(
            IVault.swap.selector,
            singleSwap,
            funds,
            limit,
            deadline
        );

        require(
            ISafe(safeConfigs[_userToSwap].safeAddress).execTransactionFromModule(
                address(0xBA12222222228d8Ba445958a75a0704d566BF2C8), // address of the IVault implementation
                0,
                data,
                Enum.Operation.Call
            ),
            "Token transfer to gnosis failed"
        );

        emit TransferToGnosisExecuted(_userToSwap, safeConfigs[_userToSwap].gnosisPayAccount, _amount);
    }

    function executeApprove(address _spender, uint256 _amount, address _userSafe) external {
        require(
            msg.sender == tenderlySigner,
            "Only the Safe may do approve"
        );
        
        bytes memory approveTx = abi.encodeWithSelector(
            IERC20.approve.selector,
            _spender,
            _amount
        );

        require(
            ISafe(safeConfigs[_userSafe].safeAddress).execTransactionFromModule(
                safeConfigs[_userSafe].tokenIn,
                0,
                approveTx,
                Enum.Operation.Call
            ),
            "token approve failed"
        );

        emit ApproveExecuted(_userSafe, _spender, _amount);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import {Enum} from "./common/Enum.sol";
import {ISafe} from "./interfaces/ISafe.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import { IVault } from "./interfaces/IVault.sol";
import { IAsset } from "./interfaces/IAsset.sol";

/// @title  SwapModule
/// @notice Module to configure users gnosis accounts, 
/// swap automatically on tokens received via Tenderly
/// and finaly send to a gnosis pay account
contract SwapModule {
    event TransferToGnosisExecuted(address from, address to, uint256 amount);
    event ApproveExecuted(address safe, address spender, uint256 amount);
    event SafeConfigured(address safe, address tokenIn, address tokenOut, address gnosisPayAccount);

    /// @dev Struct containing the configuration required to perform a swap and transfer
    struct swapConfig{
        address tokenIn;
        address tokenOut;
        address gnosisPayAccount;
        address safeAddress;
    }
    mapping(address => swapConfig) public safeConfigs;

    /// @dev authorised Tenderly signer that will be allowed to initiate transactions
    address public tenderlySigner;

    constructor(address _tenderlySigner) {
        require(_tenderlySigner != address(0), "Invalid Gnosis Safe address");
        tenderlySigner = _tenderlySigner;
    }

    /// @dev each safe that uses this module needs to configure the route and gnosis account address
    /// @param _userSafeConfig struct with the desired configuration for the given Safe account
    function configUserSafe(swapConfig calldata _userSafeConfig) external{
        require(safeConfigs[msg.sender].gnosisPayAccount == address(0), "User already configured, call modify");
        safeConfigs[msg.sender] = _userSafeConfig;

        emit SafeConfigured(_userSafeConfig.safeAddress, _userSafeConfig.tokenIn, _userSafeConfig.tokenOut, _userSafeConfig.gnosisPayAccount);
    }

    /// @dev separated logic from configuring to make sure that if the variables are overriden
    /// its not a mistake
    /// @param _userSafeConfig struct with the desired configuration for the given Safe account
    function modifyUserSafe(swapConfig calldata _userSafeConfig) external{
        safeConfigs[msg.sender] = _userSafeConfig;

        emit SafeConfigured(_userSafeConfig.safeAddress, _userSafeConfig.tokenIn, _userSafeConfig.tokenOut, _userSafeConfig.gnosisPayAccount);
    }

    /// @dev Uses the safe account function: execTransactionFromModule to swap a token on Balancer V2
    /// Needs to configure the route that the swap will perform in advance
    /// @param _amount token amount to be swaped and transfered to Gnosis pay.
    /// @param _userToSwap Safe account address that will perform the swap.
    function executeSimpleSwap(uint256 _amount, address _userToSwap) external {
        require(msg.sender == tenderlySigner, "Only the Safe may do swaps");
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

        uint256 limit = 1; // Since we dont know the exact output we assume it'll be liquid enough
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
                address(0xBA12222222228d8Ba445958a75a0704d566BF2C8), // address of the IVault implementation on Gnosis
                0, // msg.value
                data, // encoded data of the function to be called
                Enum.Operation.Call // Call type
            ),
            "Token transfer to gnosis failed"
        );

        emit TransferToGnosisExecuted(_userToSwap, safeConfigs[_userToSwap].gnosisPayAccount, _amount);
    }

    /// @dev Uses the safe account to approve Balancer V2 to spend the input token 
    /// and swap for the desired token.
    /// @param _spender address of the exchange that will spend the tokens to get the desired ones.
    /// @param _amount amount of tokens to be approved for spending.
    /// @param _userSafe Safe account address that will approve the spending.
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
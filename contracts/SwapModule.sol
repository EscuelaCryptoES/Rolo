// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "./interfaces/IERC20.sol";

contract SafeERC20TransferModule {
    struct swapConfig{
        address tokenIn;
        address tokenOut;
        address gnosisPayAccount;
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

    function swapTokenToFiat(address userToSwap, uint256 amount) external{
        require(safeConfigs[userToSwap].gnosisPayAccount != address(0), "User gnosis is address(0)");
        require(safeConfigs[userToSwap].tokenIn != address(0), "User tokenIn is address(0)");
        require(safeConfigs[userToSwap].tokenOut != address(0), "User tokenOut is address(0)");
        require(IERC20(safeConfigs[userToSwap].tokenIn).balanceOf(userToSwap) >= amount, "Trying to swap more tokens that the user has");

        
    }

    function transferERC20(address tokenAddress, address from, address to, uint256 amount) public {
        require(msg.sender == tenderlySigner, "Only callable by Tenderly");
        
        bytes memory data = abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount);
        (bool success, ) = tokenAddress.call(data);
        require(success, "Token transfer failed");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract SafeERC20TransferModule {
    address public gnosisSafe;

    constructor(address _gnosisSafe) {
        require(_gnosisSafe != address(0), "Invalid Gnosis Safe address");
        gnosisSafe = _gnosisSafe;
    }

    function transferERC20(address tokenAddress, address to, uint256 amount) public {
        require(msg.sender == gnosisSafe, "Only callable by Gnosis Safe");
        
        bytes memory data = abi.encodeWithSelector(IERC20.transfer.selector, to, amount);
        (bool success, ) = tokenAddress.call(data);
        require(success, "Token transfer failed");
    }
}

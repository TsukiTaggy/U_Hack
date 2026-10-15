// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Testnet-only training contracts for SafeStart. Deploy on Avalanche Fuji (chain ID 43113).
// Compile with solc >= 0.8.24 and EVM version "cancun" (required by OpenZeppelin v5).
// Deploy order: TestUSDC -> FakeAirdrop(TestUSDC address) -> SafeStartCert.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// Test token used in mission 5 (approve trap).
contract TestUSDC is ERC20, Ownable {
    constructor() ERC20("Test USDC", "tUSDC") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/// Demo "free airdrop" site contract. If a learner approves it, drain() pulls their
/// approved test tokens to show what an unlimited approval allows. Test tokens only.
contract FakeAirdrop {
    IERC20 public immutable token;

    event Drained(address indexed victim, uint256 amount);

    constructor(IERC20 _token) {
        token = _token;
    }

    function drain(address victim) external {
        uint256 allowed = token.allowance(victim, address(this));
        uint256 bal = token.balanceOf(victim);
        uint256 amount = allowed < bal ? allowed : bal;
        require(amount > 0, "Nothing approved");
        token.transferFrom(victim, address(this), amount);
        emit Drained(victim, amount);
    }
}

/// Non-transferable completion certificate. Only the team minter (owner) can mint.
contract SafeStartCert is ERC721, Ownable {
    uint256 public nextId;
    mapping(uint256 => uint8) public levelOf;

    constructor() ERC721("SafeStart Certificate", "SAFE") Ownable(msg.sender) {}

    function mint(address to, uint8 level) external onlyOwner returns (uint256 id) {
        require(balanceOf(to) == 0, "Already certified");
        id = nextId++;
        levelOf[id] = level;
        _safeMint(to, id);
    }

    // Allow mint (from = 0) and burn (to = 0); block every transfer.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Non-transferable");
        return super._update(to, tokenId, auth);
    }
}

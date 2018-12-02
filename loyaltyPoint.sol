pragma solidity ^0.4.20;

    contract loyaltyPoint {

        event NewPoint(uint pointID, string name, uint totalSupply);
        event ShopTransferPoint(address indexed from, address indexed to, uint pointID, uint points);
        event CustomerTransferPointToShop(address indexed from, address indexed to, uint pointID, uint points);
        event CustomerTransferPointToCustomer(address indexed from, address indexed to, uint pointID, uint points);

        address contractOwner;

        constructor() public {
            contractOwner = msg.sender;
        }

        struct ShopPoint {
            address shopAddress;
            string name;
            string symbol;
            uint8 decimals;
            uint256 totalSupply;
            uint256 currentAmount;
            uint256 pointID;
        }

        struct CustomerPoint {
            string name;
            string symbol;
            uint256 currentAmount;
            uint256 pointID;
        }

        ShopPoint[] public shopPoints;
        uint public pointCount;  
        mapping (address => ShopPoint) public shopToPoint;
        mapping (address => mapping (uint256 => CustomerPoint)) public customerToPoint;

      /**
      *  Modifier for shop and owner
      */
        modifier onlyShopOf(uint _pointID) {
           require(shopToPoint[msg.sender].pointID == _pointID);
           _;
        }

        modifier onlyOwnerOf(address _owner) {
            require(msg.sender == _owner);
            _;
        }

        /**
         * The account deployed smart contract create points for _shopAddress
         */
        function createPoint(address _shopAddress, string _pointName, string _pointSymbol, uint8 _pointDecimals, uint256 _initialSupply) onlyOwnerOf(contractOwner) public {
            uint256 _totalSupply = _initialSupply * 10 ** uint256(_pointDecimals);
            uint256 _currentAmount = _totalSupply;
            uint256 _pointID = shopPoints.push(ShopPoint(_shopAddress, _pointName, _pointSymbol, _pointDecimals, _totalSupply, _currentAmount, _pointID)) - 1;
            shopPoints[_pointID].pointID = _pointID;
            // address(msg.sendser).transfer(msg.value);
            shopToPoint[_shopAddress] = shopPoints[_pointID];
            pointCount++;
            emit NewPoint(_pointID, _pointName, _totalSupply);
        }

        /**
         * The account deployed smart contract create more points for _shopAddress
         */
        function earnMorePoint(uint256 _pointID, uint256 _morePoints) public onlyOwnerOf(contractOwner) {
            // address(msg.sender).transfer(0.001*_morePoints);
            address shopAddress = shopPoints[_pointID].shopAddress;
            shopToPoint[shopAddress].totalSupply += _morePoints;
            shopToPoint[shopAddress].currentAmount += _morePoints;
            shopPoints[_pointID].totalSupply += _morePoints;
            shopPoints[_pointID].currentAmount += _morePoints;
        }

        

        /**
         * Shop transfer point for customer when customer scan a QR code on product, only call by shop
         */
        function shopTransferPoint(address _to, uint _pointID, uint _pointsTransfer) public {
            require(shopToPoint[msg.sender].pointID == _pointID);
            
            require(_to != 0x0);
            require(shopToPoint[msg.sender].currentAmount >= _pointsTransfer);
            uint curr = customerToPoint[_to][_pointID].currentAmount;
            customerToPoint[_to][_pointID] = CustomerPoint(shopPoints[_pointID].name, shopPoints[_pointID].symbol, curr, shopPoints[_pointID].pointID);
            require(customerToPoint[_to][_pointID].currentAmount + _pointsTransfer >= customerToPoint[_to][_pointID].currentAmount);
            uint prePoint = shopToPoint[msg.sender].currentAmount + customerToPoint[_to][_pointID].currentAmount;
            shopToPoint[msg.sender].currentAmount -= _pointsTransfer;
            customerToPoint[_to][_pointID].currentAmount += _pointsTransfer;
            shopPoints[_pointID].currentAmount -= _pointsTransfer;
            emit ShopTransferPoint(msg.sender, _to, _pointID, _pointsTransfer);
            assert(shopToPoint[msg.sender].currentAmount + customerToPoint[_to][_pointID].currentAmount == prePoint);
        }

        /**
         * Customer transfer point to shop when exchange points for voucher
         */
        function customerTransferPointToShop(address _to, uint _pointID, uint _pointsTransfer) public {
            require(_to != 0x0);
            require(_to == shopToPoint[_to].shopAddress);
            require(customerToPoint[msg.sender][_pointID].currentAmount >= _pointsTransfer);
            require(shopToPoint[_to].currentAmount + _pointsTransfer >= shopToPoint[_to].currentAmount);
            uint prePoint = customerToPoint[msg.sender][_pointID].currentAmount + shopToPoint[_to].currentAmount;
            customerToPoint[msg.sender][_pointID].currentAmount -= _pointsTransfer;
            shopToPoint[_to].currentAmount += _pointsTransfer;
            shopPoints[_pointID].currentAmount += _pointsTransfer;
            emit CustomerTransferPointToShop(msg.sender, _to, _pointID, _pointsTransfer);
            assert(customerToPoint[msg.sender][_pointID].currentAmount + shopToPoint[_to].currentAmount == prePoint);
        }

         /**
         * Customer transfer point other customer to donate points
         */
        function customerTransferPointToCustomer(address _to, uint _pointID, uint _pointsTransfer) public {
            require(_to != 0x0);
            require(customerToPoint[msg.sender][_pointID].currentAmount >= _pointsTransfer);
            uint curr = customerToPoint[_to][_pointID].currentAmount;
            customerToPoint[_to][_pointID] = CustomerPoint(customerToPoint[msg.sender][_pointID].name, customerToPoint[msg.sender][_pointID].symbol, curr, customerToPoint[msg.sender][_pointID].pointID);
            require(customerToPoint[_to][_pointID].currentAmount + _pointsTransfer >= customerToPoint[_to][_pointID].currentAmount);
            uint prePoint = customerToPoint[msg.sender][_pointID].currentAmount + customerToPoint[_to][_pointID].currentAmount;
            customerToPoint[msg.sender][_pointID].currentAmount -= _pointsTransfer;
            customerToPoint[_to][_pointID].currentAmount += _pointsTransfer;
            emit CustomerTransferPointToCustomer(msg.sender, _to, _pointID, _pointsTransfer);
            assert(customerToPoint[msg.sender][_pointID].currentAmount + customerToPoint[_to][_pointID].currentAmount == prePoint);
        }

        /**
         * Update customer's point (publisher) in blockchain when execute a trading event, only call by publisher
        */
        function customerSendPointTrading(address _publisher, uint256 _pointPublisherID, uint256 _pointTraderID, uint256 _pointPublisherAmount, uint256 _pointTraderAmount) public onlyOwnerOf(_publisher) returns (address, uint256, uint256) {
            require(customerToPoint[_publisher][_pointPublisherID].currentAmount >= _pointPublisherAmount);
            customerToPoint[_publisher][_pointPublisherID].currentAmount -= _pointPublisherAmount;
            return (_publisher, _pointPublisherID, _pointPublisherAmount);
        }

        /**
         * Finish a trading event when a customer (trader) approve, only call by trader
         */
        function traderApproveTrading(address _trader, address _publisher, uint256 _pointPublisherID, uint256 _pointTraderID, uint256 _pointPublisherAmount, uint256 _pointTraderAmount) public onlyOwnerOf(_trader) {
            require(customerToPoint[_trader][_pointTraderID].currentAmount >= _pointTraderAmount);
            require(customerToPoint[_trader][_pointPublisherID].currentAmount + _pointPublisherAmount >= customerToPoint[_trader][_pointPublisherID].currentAmount);
            require(customerToPoint[_publisher][_pointTraderID].currentAmount + _pointTraderAmount >= customerToPoint[_publisher][_pointTraderID].currentAmount);

            customerToPoint[_trader][_pointTraderID].currentAmount -= _pointTraderAmount;
            //TODO
            uint traderCurr = customerToPoint[_trader][_pointPublisherID].currentAmount;
            customerToPoint[_trader][_pointPublisherID] = CustomerPoint(shopPoints[_pointPublisherID].name, shopPoints[_pointPublisherID].symbol, traderCurr, shopPoints[_pointPublisherID].pointID);

            uint publisherCurr = customerToPoint[_publisher][_pointTraderID].currentAmount;
            customerToPoint[_publisher][_pointTraderID] = CustomerPoint(shopPoints[_pointTraderID].name, shopPoints[_pointTraderID].symbol, publisherCurr, shopPoints[_pointTraderID].pointID);
            
            customerToPoint[_trader][_pointPublisherID].currentAmount += _pointPublisherAmount;
            customerToPoint[_publisher][_pointTraderID].currentAmount += _pointTraderAmount;
        }

        /**
         * Restore customer's point (publisher) when trading expires
         */
        function expiredTrading(address _publisher, uint256 _pointPublisherID, uint256 _pointPublisherAmount) public onlyOwnerOf(contractOwner) {
            require(customerToPoint[_publisher][_pointPublisherID].currentAmount + _pointPublisherAmount >= customerToPoint[_publisher][_pointPublisherID].currentAmount);
            customerToPoint[_publisher][_pointPublisherID].currentAmount += _pointPublisherAmount;
        }
    }
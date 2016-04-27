'use strict';
(function () {
    
    /*
    Stats.js initial file
     */
    os._internals.fs.disk['Stats_Data.csv'] = {
        // the actual data
        data: '1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n' +
        '1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n' +
        '1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n' +
        '1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n' +
        '1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n' +
        '1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n1,2,3,4,5,6\n4,5,6,7,8,9\n',
        // metadata ie simulated file handle
        meta: {}
    };

    /*
    dining_philosophers.js files here
     */
    os._internals.fs.disk['philo1.csv'] = {
        // the actual data
        data: '1,2,3,4,5',
        meta: {}
    };

    os._internals.fs.disk['philo2.csv'] = {
        // the actual data
        data: '2,4,6,8,10',
        meta: {}
    };

    os._internals.fs.disk['philo3.csv'] = {
        // the actual data
        data: '2,7,2,4,2',
        meta: {}
    };

    os._internals.fs.disk['philo4.csv'] = {
        // the actual data
        data: '1,8,4,8,8',
        meta: {}
    };

    // add more initial files here

    /*
    VectorCalculator.js initial file
     */
    os._internals.fs.disk['vector_data.csv'] = {
        // actual data
        data: '1,2\n' +
            '2,3\n' +
            '1,3\n' +
            '5,5',
        meta: {}
    };

    os._internals.fs.disk['Contact_Data.csv'] = {

        data: 'LoganF,6264947298\n' +
        'freddy,6264947298\n' +
        'josh,6264947298\n' +
        'mike,5555555\n' +
        'LoganF,6264947298\n',

        meta: {}
    };

    //GetInitials.js initial file
    os._internals.fs.disk['rapper_names.csv'] = {

        data: "Calvin Broadus,Andre Young,O'shea Jackson,Eric Wright," + 
                "Marshall Mathers,Dwayne Carter,Shawn Carter,James Jackson," +
                "Earl Simmons,Antonio Hardy,Krisna Parker,William Griffin," + 
                "Nasir Jones,Tariq Trotter,Ahmir Thompson,Kamaal Fareed," +
                "Malik Taylor,Dante Smith, Talib Greene,Cristopher Bridges," + 
                "Sean Combs,Christopher Wallace,Trevor Smith,Andre Benjamin," +
                " Antwan Patton,Tupac Shakur,William Drayton,Carlton Ridenhour," + 
                "Adam Horovitz,Michael Diamond,Adam Yauch,Joseph Simmons,"+
                "Darryl McDaniels,Jason Mizell,Robert Diggs,Gary Grice," + 
                "Russell Jones,Clifford Smith,Corey Woods,Jason Hunter," +
                "Dennis Coles,Jamel Arief,Lamont Hawkins",

        meta: {}

    };

	os._internals.fs.disk['Transaction_Data.csv'] = {

        data: 	"Starting Balance,+200.00\n" +
				"Caramel Frappucino,5.88\n" +
				"Panda Express,7.87\n" +
				"Paycheck,+582.03\n" +
				"Mechanical Keyboard,103.58\n" +
				"Taqueria Girasol,6.47\n" +
				"Ha Tien Vietnamese Cove,8.75\n" +
				"Trader Joe's,21.62\n" +
				"Lucky Supermarket,31.05\n" +
				"Paypal Payment,220.00\n" +
				"Ebill Payment,660.23\n" +
				"March Rent,1002.42\n" +
				"Paypal Refund,+600.03\n" +
				"Tax Refund,+103.58\n" +
				"COSTCO,500.62\n" +
				"Taco Bell,6.47\n" +
				"Chase ATM Withdrawl,40.00\n" +
				"Chevron,56.13\n" +
				"Ikes,8.75\n" +
				"T-Mobile Bill,79.45\n" +
				"SafeWay,21.62\n" +
				"StarBucks,2.41\n" +
				"Pizza Hut,24.62\n" +
				"Amazon Gift,212.12\n" +
				"SFSU BOOKSTORE,321.22\n" +
				"Steam Purchase,10.00\n" +
				"Kabam Purchase,20.00\n" +
				"Clash of Clans,15.00\n" +
				"Amazon Refund,+1600.99\n" +
				"Verizon Bill,156.58\n" +
				"SafeWay,42.21\n" +
				"Papa Johns,32.16\n" +
				"Hall of Flame,14.32\n" +
				"Mikes Shooting Range,102.23\n" +
				"Chevron,56.13\n" +
				"SFSU BOOKSTORE,1.29\n" +
				"SFSU BOOKSTORE REFUND,+323.98\n" +
				"Ross,167.97\n" +
				"Chase ATM Withdrawl,240.00\n" +
				"Target,42.22\n" +
				"COSTCO,4.62\n" +
				"COSTCO,500.62\n" +
				"Credit ChargeBack,+724.62\n" +
				"Sprint Bill,132.32\n" +
				"McDonalds,11.92\n" +
				"Wal Mart,136.12\n" +
				"GameStop,24.62\n" +
				"Chevron,56.13\n" +
				"Game Stop Sell Games,+123.98\n" +
				"Ruby Skye,312.99\n" +
				"Mc Teagues,66.32\n" +
				"Ebay Purchase,13.12\n" +
				"Banana Republic,224.62\n" +
				"Apple Store,632.93\n" +
				"Pay Pal Refund,+932.22\n" +
				"SafeWay,112.13\n" +
				"Lucks,60.00\n" +
				"Trader Joes,30.23\n" +
				"Bose,200.31\n" +
				"Enterprise Refund,+250.67\n" +
				"Korean BBQ,56.22\n" +
				"Venmo,75.12\n" +
				"Chase ATM Withdrawl,140.00\n" +
				"Lyft,12.33\n" +
				"Uber,34.33\n" +
				"Amazon Refund,+35.00\n" +
				"Post Office,12.32\n" +
				"NY Subscription,9.40\n" +
				"Shell,6.82\n" +
				"Nike,142.32\n" +
				"SouthWest,323.62\n" +
				"Larry Flynt's Club,400.62\n" +
				"Green Cure,110.00\n" +
				"Papal Checkout,+2000.62\n" +
				"Chase Wire Xfer,+1700.00\n" +
				"Hookah Lounge,66.12\n" +
				"Hilton,600.62\n" +
				"Ikea Refund,+400.12\n" +
				"The Lister,44.12\n" +
				"Ticket Master,233.12\n" +
				"SFSU Health Center,32.00\n" +
				"Clipper Card,40.00\n" +
				"Chase ChargeBack,+101.32\n" +
				"Chase ATM Withdrawl,20.00\n" +
				"Chase Wire Xfer,2000.00\n" +
				"Village Market,22.22\n" +
				"Ikes Place,12.62\n" +
				"Twitch Sub,3.99\n" +
				"Steam Purchase,15.00\n" +
				"Papa Johns,32.62\n" +
				"Hot Topic,9.99\n" +
				"Olive Garden,56.62\n" +
				"Target,9.59\n" +
				"See's Candy,42.12\n" +
				"Boduine,18.11\n" +
				"Daddy's Smoke Shop,50.13\n" +
				"Super Cuts,25.00\n" +
				"The GG shop,50.00\n" +
				"Forever 21,40.00\n" +
				"Forever 21,40.00\n" +
				"Teller Deposit,+1200",

        meta: {}
    };


})();

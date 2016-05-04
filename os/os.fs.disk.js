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

    os._internals.fs.disk['random_ints.csv']={
	data:"50,88,54,65,98,10,68,56,44,26," +
		"42,47,83,6,5,22,85,61,82,45," +
		"28,70,96,35,21,48,34,29,35,4," +
		"52,53,33,33,26,56,34,21,63,77," +
		"15,41,91,68,100,28,26,46,91,24," +
		"35,74,32,1,61,31,36,17,64,47," +
		"1,86,22,11,64,86,37,9,93,56," +
		"18,69,61,92,61,37,39,10,95,88," +
		"77,46,38,8,34,34,71,42,59,9," +
		"24,46,36,48,9,80,76,28,65,24," +
		"54,92,94,63,20,47,94,1,93,91," +
		"1,8,35,92,79,9,18,47,98,89," +
		"66,88,25,14,46,89,91,62,69,8," +
		"60,25,24,87,17,47,72,53,58,93," +
		"50,88,32,100,75,21,95,100,35,32," +
		"68,78,76,83,29,47,29,19,1,64," +
		"28,42,72,25,68,67,12,76,5,41," +
		"5,27,55,89,49,64,85,84,100,14," +
		"96,55,28,78,91,45,55,22,38,17," +
		"71,20,47,38,25,95,51,42,15,48," +
		"47,15,55,4,47,36,39,46,72,25," +
		"86,40,82,54,99,51,36,35,97,41," +
		"47,86,62,75,44,86,79,16,95,75," +
		"32,80,40,89,75,26,6,73,75,6," +
		"48,35,34,53,54,84,81,73,51,87," +
		"22,75,12,48,23,8,27,54,69,39," +
		"12,76,87,99,60,54,2,11,42,93," +
		"31,58,52,84,41,70,9,63,94,93," +
		"42,58,23,62,65,38,15,65,60,50," +
		"35,72,85,46,71,27,4,66,53,6," +
		"62,29,69,27,97,66,68,73,78,40," +
		"90,73,25,71,39,68,96,86,63,46," +
		"68,71,98,94,84,47,16,45,30,22," +
		"94,33,95,4,94,54,20,84,77,7," +
		"43,19,73,45,34,65,37,97,81,28," +
		"37,77,15,2,23,51,94,79,63,57," +
		"87,91,41,52,20,38,95,50,54,52," +
		"76,46,4,88,96,25,84,66,46,62," +
		"3,29,61,24,34,56,78,30,59,10," +
		"83,94,94,29,87,74,83,95,48,65," +
		"25,23,72,61,84,16,96,34,50,97," +
		"94,3,79,81,97,87,41,7,41,90," +
		"37,84,49,15,55,66,29,94,1,75," +
		"86,91,29,5,54,4,97,85,81,91," +
		"59,26,97,93,79,25,50,48,40,96," +
		"44,4,10,58,69,1,37,31,66,47," +
		"9,27,56,46,28,69,46,38,85,36," +
		"87,96,38,31,45,38,50,75,63,61," +
		"7,69,66,52,94,40,46,42,93,20," +
		"69,81,52,45,13,27,69,91,1,54," +
		"85,65,86,47,57,49,42,77,91,61," +
		"74,80,96,78,42,13,5,9,71,95," +
		"97,79,75,35,88,3,92,4,61,61," +
		"59,53,69,28,63,15,93,42,28,99," +
		"62,31,39,88,95,78,37,58,81,42," +
		"75,36,44,67,56,94,54,93,70,10," +
		"82,94,68,18,21,5,52,53,2,42," +
		"17,28,98,77,19,51,52,20,69,35," +
		"3,64,6,31,26,76,94,39,90,47," +
		"61,92,59,58,15,18,78,99,55,40",
	meta:{}
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

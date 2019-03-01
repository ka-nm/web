<template>
    <v-card class="elevation-12">
        <v-toolbar dark color="primary">
            <v-toolbar-title>Setup Instructions</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <h2>Initial Setup</h2>
            <ol>
                <li>Plug in the device. Upon boot up you should see a blue network connection icon identifying that it’s ready to be paired.</li>
                <li>Make sure where you’re setting up the DigiPig has access to a 2.4GHz spectrum hot spot.
                <li>Fill in the above fields:
                    a. The Device ID is on the back of the DigiPig and the bottom of the box.
                    b. Once adding email at the sign-up page, be sure to verify email from the address used
                    from your inbox before attempting to log in after setup.
                <li>Once verified proceed to log in to the device with email and password.
                <li>Start adding Savings Goals</li>
            </ol>
            <h2>Use</h2>
            <ul>
                <li>Main screen has the ability to quickly add Money/Allowance across all enabled Savings Goals.</li>
                <li>For each Savings Goal there is also the opportunity to “Promise” money toward that particular goal. Once added, the goal will light up the appropriately added amount in a half-lit LED to show how much will go toward the goal upon completion of agreement.</li>
            </ul>
            <div class="mt-4 text-xs-center"><a href="/DigiPig_Prototype_Version_1_setup.pdf" target="_blank">Click here for full setup instructions.</a></div>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {

    };
</script>

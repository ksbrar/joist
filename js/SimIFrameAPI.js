//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The iframe API for communicating with a PhET Simulation using postMessage.  Every Sim has one SimIFrameAPI associated with it,
 * if enabled with the query parameter.
 * The syntax for communication is command [argument]
 *
 * The supported API commands are:
 * connect: the parent frame requests a connection to this frame.  Response is "connected".
 * addSimStateListener: the parent registers to receive states from the sim, one per frame
 * addSimEventListener: the parent registers to receive event streams from the sim
 * setActive BOOLEAN: sets the sim to be active (running, and interactive) or inactive (passive, and ready to display states)
 * setState STRING: sets the state of the sim from a captured state.
 *
 * Example API usage is provided in together/record-playback-iframe.html
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var SimJSON = require( 'JOIST/SimJSON' );

  var protocolVersion = {protocolVersion: '0.0.1'};

  var addProtocol = function( message ) {
    return _.extend( protocolVersion, message );
  };
  var wrap = function( message ) {
    return JSON.stringify( addProtocol( message ) );
  };
  var send = function( target, message ) {
    target.postMessage( wrap( message ), '*' );
  };

  return {

    // Singleton pattern, just use an initialize function
    initialize: function( sim ) {
      console.log( 'enabled SimIFrameAPI' );

      var stateListeners = [];

      // Listen for messages as early as possible, so that a client can establish a connection early.
      window.addEventListener( 'message', function( event ) {
        var message = JSON.parse( event.data );
        var command = message.command;
        if ( message.protocolVersion !== protocolVersion.protocolVersion ) {
          return;
        }

        // The iframe has requested a connection after startup.  Reply with a 'connected' message so it can finalize initalization
        if ( command === 'connect' ) {
          send( event.source, {command: 'connected'} );
        }
        else if ( command === 'addSimStateListener' ) {
          stateListeners.push( event.source );
        }
        else if ( command === 'addSimEventListener' ) {

          // Wire into the existing infrastructure in arch.js, which is currently private
          // Note: this is subject to change based on https://github.com/phetsims/arch/issues/2
          if ( window.phetEvents ) {
            window.phetEvents.targets.push( function( message ) {
              send( event.source, {command: 'addEvent', event: message} );
            } );
          }
        }
        else if ( command === 'setActive' ) {
          sim.active = message.value;
        }
        else if ( command === 'setState' ) {
          sim.setState( JSON.parse( message.value, SimJSON.reviver ) );
        }
      } );

      sim.on( 'frameCompleted', function() {
          if ( sim.active && stateListeners.length > 0 ) {

            // TODO: perhaps we shouldn't record whether the sim is active, since that value may be overriden by setState
            // Though this hasn't shown any problems in testing
            var state = sim.getState();
            var stateString = JSON.stringify( state, SimJSON.replacer );
            for ( var i = 0; i < stateListeners.length; i++ ) {
              send( stateListeners[i], {command: 'addState', state: stateString} );
            }
          }
        }
      );
    }
  };
} );
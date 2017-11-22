// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/joist's PhetMenu
   * @param phetMenu
   * @param phetioID
   * @constructor
   */
  function PhetMenuIO( phetMenu, phetioID ) {
    assert && assertInstanceOf( phetMenu, phet.joist.PhetMenu );
    ObjectIO.call( this, phetMenu, phetioID );
  }

  // don't inherit from NodeIO so that its visibility can't be changed
  phetioInherit( ObjectIO, 'PhetMenuIO', PhetMenuIO, {}, {
    documentation: 'The PhET Menu in the bottom right of the screen',
    event: [ 'fired' ]
  } );

  joist.register( 'PhetMenuIO', PhetMenuIO );

  return PhetMenuIO;
} );


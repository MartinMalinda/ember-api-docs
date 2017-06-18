import Ember from 'ember';
import _ from 'lodash';
import semverCompare from 'npm:semver-compare';
import getMinorVersion from "../utils/get-minor-version";
import FilterParams from '../mixins/filter-params';

const { Controller, computed, A, inject: {service} } = Ember;

const getRelationshipIDs = function(relationshipName) {
  return computed('model', function() {
    const classes = this.get('model').hasMany(relationshipName);
    const sorted = A(classes.ids()).sort();
    return A(sorted).toArray().map(id => id.split('-').pop());
  });
};


const getModuleRelationships = function(moduleType) {
  return computed('model', function() {
    const versionId = this.get('model.id');
    this.getModuleRelationships(versionId, moduleType);
  });
};

export default Controller.extend(FilterParams, {

  filterData: service(),

  metaStore: service(),

  showPrivateClasses: computed.alias('filterData.sideNav.showPrivate'),

  classesIDs:  getRelationshipIDs('classes'),
  publicClassesIDs:  getRelationshipIDs('public-classes'),
  namespaceIDs:  getRelationshipIDs('namespaces'),
  publicNamespaceIDs:  getRelationshipIDs('public-namespaces'),

  moduleIDs: getModuleRelationships('modules'),
  publicModuleIDs: getModuleRelationships('public-modules'),

  getRelations(relationship) {
    return this.get('model').hasMany(relationship).ids().sort();
  },

  getModuleRelationships(versionId, moduleType) {
    let relations = this.getRelations(moduleType);
    return relations.map(id => id.substring(versionId.length + 1))
  },

  shownClassesIDs: computed('showPrivateClasses', 'classesIDs', 'publicClassesIDs', function() {
    return this.get('showPrivateClasses') ? this.get('classesIDs') : this.get('publicClassesIDs');
  }),

  shownModuleIDs: computed('showPrivateClasses', 'moduleIDs', 'publicModuleIDs', function() {
    return this.get('showPrivateClasses') ? this.get('moduleIDs') : this.get('publicModuleIDs');
  }),

  shownNamespaceIDs: computed('showPrivateClasses', 'namespaceIDs', 'publicNamespaceIDs', function() {
    return this.get('showPrivateClasses') ? this.get('namespaceIDs') : this.get('publicNamespaceIDs');
  }),

  projectVersions: computed('metaStore.availableProjectVersions', 'model.project.id', function() {
    const projectVersions = this.get('metaStore.availableProjectVersions')[this.get('model.project.id')];
    let versions = projectVersions.sort((a, b) => semverCompare(b, a));

    versions = versions.map((version) => {
      const minorVersion = getMinorVersion(version);
      return { id: version, minorVersion };
    });
    let groupedVersions = _.groupBy(versions, version => version.minorVersion);

    return _.values(groupedVersions).map(groupedVersion => groupedVersion[0]);
  }),

  selectedProjectVersion:computed('projectVersions.[]', 'model.version', function() {
    return this.get('projectVersions').filter(pV => pV.id === this.get('model.version'))[0];
  }),

  activeProject: computed.readOnly('model.project.id')
});
